from unittest import TestCase

from models.schemas import SentenceResult
from utils.aggregator import aggregate_results


def _result(
    verdict: str,
    *,
    critical: bool = False,
    confidence: float = 0.8,
    similarity: float = 0.3,
) -> SentenceResult:
    return SentenceResult(
        sentence="x",
        verdict=verdict,
        explanation="ok",
        confidence=confidence,
        critical=critical,
        similarity_score=similarity,
    )


class AggregatorTests(TestCase):
    def test_critical_override_sets_hallucinated(self) -> None:
        out = aggregate_results([_result("faithful"), _result("partial", critical=True)])
        self.assertEqual(out["overall_verdict"], "hallucinated")
        self.assertEqual(out["stats"]["critical_count"], 1)

    def test_issue_ratio_threshold_sets_hallucinated(self) -> None:
        out = aggregate_results(
            [_result("faithful"), _result("drifting"), _result("partial"), _result("unverifiable"), _result("faithful")]
        )
        self.assertEqual(out["overall_verdict"], "hallucinated")

    def test_drifting_majority_sets_drifting(self) -> None:
        out = aggregate_results(
            [
                _result("faithful"),
                _result("faithful"),
                _result("faithful"),
                _result("faithful"),
                _result("drifting"),
                _result("drifting"),
            ]
        )
        self.assertEqual(out["overall_verdict"], "drifting")

    def test_all_faithful_sets_faithful(self) -> None:
        out = aggregate_results([_result("faithful"), _result("faithful")])
        self.assertEqual(out["overall_verdict"], "faithful")
        self.assertEqual(out["stats"]["issues"], 0)

    def test_empty_results_are_safe(self) -> None:
        out = aggregate_results([])
        self.assertEqual(out["overall_verdict"], "faithful")
        self.assertEqual(out["overall_confidence"], 1.0)
