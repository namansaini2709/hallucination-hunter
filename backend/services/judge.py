from typing import Literal

from models.schemas import SentenceResult


Verdict = Literal["faithful", "hallucinated", "drifting", "partial", "unverifiable"]


def judge_sentences(
    passage: str,
    question: str,
    sentences: list[str],
    similarity_scores: list[float],
) -> list[SentenceResult]:
    # Placeholder judge implementation so the route works before the LLM integration lands.
    results: list[SentenceResult] = []
    for sentence, similarity in zip(sentences, similarity_scores, strict=False):
        verdict: Verdict = "unverifiable"
        explanation = "Marked for LLM review; placeholder judge could not verify it yet."
        critical = False

        if question and question.lower() not in sentence.lower() and similarity < 0.2:
            verdict = "drifting"
            explanation = "The sentence appears weakly related to both the passage and question."
        elif similarity < 0.15:
            verdict = "hallucinated"
            explanation = "The sentence has very low overlap with the source passage."
            critical = True
        elif similarity < 0.3:
            verdict = "partial"
            explanation = "The sentence may contain some overlap but is not fully supported."

        results.append(
            SentenceResult(
                sentence=sentence,
                verdict=verdict,
                explanation=explanation,
                confidence=round(max(0.2, 1 - similarity), 2),
                critical=critical,
                similarity_score=round(similarity, 2),
            )
        )

    return results
