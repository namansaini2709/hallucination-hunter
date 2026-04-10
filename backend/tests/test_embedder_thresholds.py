from unittest import TestCase
from unittest.mock import patch

from services.embedder import classify_similarity, get_similarity_thresholds, is_suspicious


class EmbedderThresholdTests(TestCase):
    def test_three_zone_classification(self) -> None:
        with patch.dict(
            "os.environ",
            {"SUSPICIOUS_THRESHOLD": "0.45", "SAFE_THRESHOLD": "0.72"},
            clear=False,
        ):
            self.assertEqual(classify_similarity(0.40), "suspicious")
            self.assertEqual(classify_similarity(0.60), "gray")
            self.assertEqual(classify_similarity(0.80), "safe")

    def test_is_suspicious_routes_gray_to_judge(self) -> None:
        with patch.dict(
            "os.environ",
            {"SUSPICIOUS_THRESHOLD": "0.45", "SAFE_THRESHOLD": "0.72"},
            clear=False,
        ):
            self.assertTrue(is_suspicious(0.60))
            self.assertFalse(is_suspicious(0.80))

    def test_legacy_threshold_keeps_compat(self) -> None:
        with patch.dict(
            "os.environ",
            {
                "SIMILARITY_THRESHOLD": "0.55",
                "SUSPICIOUS_THRESHOLD": "",
                "SAFE_THRESHOLD": "",
            },
            clear=False,
        ):
            suspicious, safe = get_similarity_thresholds()
            self.assertAlmostEqual(safe, 0.55, places=3)
            self.assertAlmostEqual(suspicious, 0.45, places=3)
