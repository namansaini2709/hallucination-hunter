from collections import Counter

from models.schemas import SentenceResult


def aggregate_results(sentence_results: list[SentenceResult]) -> dict:
    total = len(sentence_results)
    counts = Counter(result.verdict for result in sentence_results)
    issues = total - counts.get("faithful", 0)
    critical_count = sum(1 for result in sentence_results if result.critical)
    issue_ratio = issues / total if total else 0.0

    if critical_count:
        overall_verdict = "hallucinated"
    elif issue_ratio >= 0.4:
        overall_verdict = "hallucinated"
    elif issues > 0:
        overall_verdict = (
            "drifting"
            if counts.get("drifting", 0) > counts.get("hallucinated", 0)
            else "partial"
        )
    else:
        overall_verdict = "faithful"

    overall_confidence = round(max(0.1, 1.0 - (issue_ratio * 0.8)), 2)
    summary = _build_summary(overall_verdict, counts, critical_count)

    return {
        "overall_verdict": overall_verdict,
        "overall_confidence": overall_confidence,
        "summary": summary,
        "stats": {
            "total": total,
            "issues": issues,
            "faithful": counts.get("faithful", 0),
            "drifting": counts.get("drifting", 0),
            "critical_count": critical_count,
        },
    }


def _build_summary(overall_verdict: str, counts: Counter, critical_count: int) -> str:
    if overall_verdict == "faithful":
        return "The response appears faithful to the source passage."
    if critical_count:
        return "At least one sentence contains a critical factual issue."
    if counts.get("drifting", 0):
        return "Some sentences appear relevantly weak or off-topic."
    if counts.get("partial", 0):
        return "Some sentences are only partially supported by the passage."
    return "The response contains unsupported or inconsistent content."
