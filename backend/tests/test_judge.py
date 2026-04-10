from unittest import TestCase
from unittest.mock import patch

from services.judge import judge_sentences


class FakeCompletions:
    def __init__(self, text: str) -> None:
        self._text = text

    def create(self, **kwargs):  # noqa: ANN003
        return {"choices": [{"message": {"content": self._text}}]}


class FakeChat:
    def __init__(self, text: str) -> None:
        self.completions = FakeCompletions(text)


class FakeClient:
    def __init__(self, text: str) -> None:
        self.chat = FakeChat(text)


class JudgeTests(TestCase):
    def test_judge_parses_valid_json_and_clamps_fields(self) -> None:
        client = FakeClient(
            """
            [
              {"index": 1, "verdict": "hallucinated", "explanation": "Conflicts with the passage.", "confidence": 1.5, "critical": true},
              {"index": 2, "verdict": "drifting", "explanation": "Off-topic for the question.", "confidence": 0.72, "critical": false}
            ]
            """
        )
        results = judge_sentences(
            passage="The Eiffel Tower is in Paris.",
            question="Where is the Eiffel Tower?",
            sentences=["It is in London.", "Tourism in Europe is important."],
            similarity_scores=[0.12, 0.2],
            client=client,
        )

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].verdict, "hallucinated")
        self.assertTrue(results[0].critical)
        self.assertEqual(results[0].confidence, 1.0)
        self.assertEqual(results[1].verdict, "drifting")
        self.assertEqual(results[1].confidence, 0.72)

    def test_judge_falls_back_when_json_is_invalid(self) -> None:
        client = FakeClient("not-json")
        results = judge_sentences(
            passage="A",
            question="",
            sentences=["Sentence one."],
            similarity_scores=[0.11],
            client=client,
        )

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].verdict, "unverifiable")
        self.assertFalse(results[0].critical)
        self.assertEqual(results[0].confidence, 0.3)

    def test_judge_falls_back_when_no_api_key(self) -> None:
        with patch.dict("os.environ", {"GROQ_API_KEY": ""}, clear=False):
            results = judge_sentences(
                passage="A",
                question="",
                sentences=["Sentence one."],
                similarity_scores=[0.21],
            )

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].verdict, "unverifiable")
