import json
import os
from urllib import error, request
from typing import Any, Literal, cast

from dotenv import load_dotenv
from models.schemas import SentenceResult

load_dotenv()


Verdict = Literal["faithful", "hallucinated", "drifting", "partial", "unverifiable"]

ALLOWED_VERDICTS: set[str] = {
    "faithful",
    "hallucinated",
    "drifting",
    "partial",
    "unverifiable",
}

DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
DEFAULT_BASE_URL = os.getenv("GROQ_API_BASE_URL", "https://api.groq.com/openai/v1")

SYSTEM_PROMPT = """You are a hallucination and relevance detection engine.

Given a source passage, an optional user question, and a list of AI response sentences, evaluate each sentence.

Return only a valid JSON array. No markdown. No preamble.
Each item must have:
- index: integer sentence number starting at 1
- verdict: faithful | hallucinated | drifting | partial | unverifiable
- explanation: one concise sentence
- confidence: float 0.0 to 1.0
- critical: true only when sentence has a core factual error
"""


def judge_sentences(
    passage: str,
    question: str,
    sentences: list[str],
    similarity_scores: list[float],
    client: Any | None = None,
) -> list[SentenceResult]:
    if not sentences:
        return []

    normalized_scores = _normalize_similarity_scores(sentences, similarity_scores)

    try:
        raw_text = _run_judge_call(
            passage=passage,
            question=question,
            sentences=sentences,
            client=client,
        )
        parsed = _parse_judge_response(raw_text)
    except Exception:
        return _fallback_results(sentences, normalized_scores)

    return _map_to_sentence_results(
        sentences=sentences,
        similarity_scores=normalized_scores,
        parsed_items=parsed,
    )


def _run_judge_call(passage: str, question: str, sentences: list[str], client: Any | None) -> str:
    if client is not None:
        return _call_client(client, passage, question, sentences)
    return _call_groq_api(passage, question, sentences)


def _build_user_message(passage: str, question: str, sentences: list[str]) -> str:
    lines = [f"{i}. {sentence}" for i, sentence in enumerate(sentences, start=1)]
    question_value = question if question else "N/A"
    return (
        f'Passage: """{passage}"""\n\n'
        f'User question: "{question_value}"\n\n'
        "Sentences to evaluate:\n"
        + "\n".join(lines)
    )


def _call_client(client: Any, passage: str, question: str, sentences: list[str]) -> str:
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        temperature=0,
        max_tokens=1200,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_message(passage, question, sentences)},
        ],
    )
    return _extract_chat_content(response)


def _call_groq_api(passage: str, question: str, sentences: list[str]) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GROQ_API_KEY is required for judge calls.")

    url = f"{DEFAULT_BASE_URL.rstrip('/')}/chat/completions"
    payload = {
        "model": DEFAULT_MODEL,
        "temperature": 0,
        "max_tokens": 1200,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_message(passage, question, sentences)},
        ],
    }
    body = json.dumps(payload).encode("utf-8")

    req = request.Request(
        url=url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "hallucination-hunter/1.0",
        },
    )
    try:
        with request.urlopen(req, timeout=45) as res:
            response_data = res.read().decode("utf-8")
    except error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")[:400]
        raise RuntimeError(f"Groq API call failed: HTTP {exc.code} {details}") from exc
    except error.URLError as exc:
        raise RuntimeError("Groq API call failed.") from exc

    parsed = json.loads(response_data)
    return _extract_chat_content(parsed)


def _extract_chat_content(response: Any) -> str:
    if isinstance(response, dict):
        choices = response.get("choices", [])
        if choices and isinstance(choices[0], dict):
            message = choices[0].get("message", {})
            if isinstance(message, dict):
                content = message.get("content", "")
                if isinstance(content, str):
                    return content.strip()

    choices = getattr(response, "choices", None)
    if choices:
        first_choice = choices[0]
        message = getattr(first_choice, "message", None)
        content = getattr(message, "content", None)
        if isinstance(content, str):
            return content.strip()

    return ""


def _parse_judge_response(raw_text: str) -> list[dict[str, Any]]:
    candidate = raw_text.strip()
    if candidate.startswith("```"):
        candidate = candidate.strip("`").strip()
        if candidate.startswith("json"):
            candidate = candidate[4:].strip()

    parsed = json.loads(candidate)
    if isinstance(parsed, dict):
        results = parsed.get("results") or parsed.get("items")
        if isinstance(results, list):
            parsed = results

    if not isinstance(parsed, list):
        raise ValueError("Judge response must be a JSON array.")

    return [item for item in parsed if isinstance(item, dict)]


def _map_to_sentence_results(
    sentences: list[str],
    similarity_scores: list[float],
    parsed_items: list[dict[str, Any]],
) -> list[SentenceResult]:
    by_index: dict[int, dict[str, Any]] = {}
    for position, item in enumerate(parsed_items):
        index = _safe_int(item.get("index"), fallback=position + 1)
        if 1 <= index <= len(sentences):
            by_index[index] = item

    results: list[SentenceResult] = []
    for index, sentence in enumerate(sentences, start=1):
        item = by_index.get(index)
        similarity = similarity_scores[index - 1]
        if item is None:
            results.append(_fallback_result(sentence, similarity))
            continue

        verdict_raw = str(item.get("verdict", "")).strip().lower()
        verdict = cast(Verdict, verdict_raw if verdict_raw in ALLOWED_VERDICTS else "unverifiable")
        explanation_raw = str(item.get("explanation", "")).strip()
        explanation = (
            explanation_raw
            if explanation_raw
            else "Judge response was missing explanation for this sentence."
        )

        confidence = _clamp_confidence(item.get("confidence"), fallback=0.5)
        critical = bool(item.get("critical", False))

        results.append(
            SentenceResult(
                sentence=sentence,
                verdict=verdict,
                explanation=explanation,
                confidence=confidence,
                critical=critical,
                similarity_score=round(similarity, 2),
            )
        )

    return results


def _fallback_results(sentences: list[str], similarity_scores: list[float]) -> list[SentenceResult]:
    return [
        _fallback_result(sentence=sentence, similarity=similarity)
        for sentence, similarity in zip(sentences, similarity_scores, strict=True)
    ]


def _fallback_result(sentence: str, similarity: float) -> SentenceResult:
    return SentenceResult(
        sentence=sentence,
        verdict="unverifiable",
        explanation="LLM judge unavailable or returned invalid output; marked as unverifiable.",
        confidence=0.3,
        critical=False,
        similarity_score=round(similarity, 2),
    )


def _normalize_similarity_scores(sentences: list[str], similarity_scores: list[float]) -> list[float]:
    scores = [float(score) for score in similarity_scores[: len(sentences)]]
    if len(scores) < len(sentences):
        scores.extend([0.0] * (len(sentences) - len(scores)))
    return scores


def _clamp_confidence(value: Any, fallback: float) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        confidence = fallback
    return round(max(0.0, min(1.0, confidence)), 2)


def _safe_int(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback
