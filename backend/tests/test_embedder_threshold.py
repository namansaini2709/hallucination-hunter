from unittest import TestCase
from unittest.mock import patch

from services.embedder import get_similarity_threshold, is_suspicious


class EmbedderThresholdTests(TestCase):
    def test_threshold_defaults_when_env_missing(self) -> None:
        with patch.dict("os.environ", {}, clear=True):
            self.assertAlmostEqual(get_similarity_threshold(), 0.92, places=3)

    def test_threshold_reads_env(self) -> None:
        with patch.dict("os.environ", {"SIMILARITY_THRESHOLD": "0.8"}, clear=False):
            self.assertAlmostEqual(get_similarity_threshold(), 0.8, places=3)

    def test_suspicious_check_uses_single_threshold(self) -> None:
        with patch.dict("os.environ", {"SIMILARITY_THRESHOLD": "0.8"}, clear=False):
            self.assertTrue(is_suspicious(0.79))
            self.assertFalse(is_suspicious(0.8))
            self.assertFalse(is_suspicious(0.9))
