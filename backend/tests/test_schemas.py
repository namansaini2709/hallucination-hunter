from pydantic import ValidationError

from models.schemas import AnalyzeRequest, ResponseStats, SentenceResult


def test_analyze_request_normalizes_text_fields() -> None:
    request = AnalyzeRequest(
        passage="  source text  ",
        question="  what happened?  ",
        ai_response="  model output.  ",
    )

    assert request.passage == "source text"
    assert request.question == "what happened?"
    assert request.ai_response == "model output."


def test_sentence_result_rejects_empty_explanation() -> None:
    try:
        SentenceResult(
            sentence="A real sentence.",
            verdict="faithful",
            explanation="   ",
            confidence=0.9,
            critical=False,
            similarity_score=0.8,
        )
    except ValidationError as exc:
        assert "Value cannot be empty" in str(exc)
    else:
        raise AssertionError("Expected SentenceResult validation to fail.")


def test_response_stats_requires_non_negative_values() -> None:
    try:
        ResponseStats(
            total=-1,
            issues=0,
            faithful=0,
            drifting=0,
            critical_count=0,
        )
    except ValidationError as exc:
        assert "greater than or equal to 0" in str(exc)
    else:
        raise AssertionError("Expected ResponseStats validation to fail.")
