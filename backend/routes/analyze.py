from fastapi import APIRouter

from models.schemas import AnalyzeRequest, AnalyzeResponse, SentenceResult
from services.embedder import get_similarity, is_suspicious
from services.judge import judge_sentences
from services.splitter import split_sentences
from utils.aggregator import aggregate_results


router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    sentences = split_sentences(request.ai_response)

    results: list[SentenceResult | None] = [None] * len(sentences)
    suspicious_pairs: list[tuple[int, str, float]] = []

    for index, sentence in enumerate(sentences):
        similarity = get_similarity(sentence=sentence, passage=request.passage)
        if is_suspicious(similarity):
            suspicious_pairs.append((index, sentence, similarity))
            continue

        results[index] = SentenceResult(
            sentence=sentence,
            verdict="faithful",
            explanation="Similarity score is above the safe threshold.",
            confidence=round(similarity, 2),
            critical=False,
            similarity_score=round(similarity, 2),
        )

    if suspicious_pairs:
        judged = judge_sentences(
            passage=request.passage,
            question=request.question,
            sentences=[item[1] for item in suspicious_pairs],
            similarity_scores=[item[2] for item in suspicious_pairs],
        )
        for (index, _, _), judged_result in zip(suspicious_pairs, judged, strict=False):
            results[index] = judged_result

    ordered_results = [result for result in results if result is not None]
    overall = aggregate_results(ordered_results)

    return AnalyzeResponse(
        overall_verdict=overall["overall_verdict"],
        overall_confidence=overall["overall_confidence"],
        summary=overall["summary"],
        sentences=ordered_results,
        stats=overall["stats"],
    )
