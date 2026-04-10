from fastapi.testclient import TestClient

from main import app
from models.schemas import SentenceResult


client = TestClient(app)


def test_analyze_returns_ordered_results(monkeypatch) -> None:
    similarities = iter([0.9, 0.2])

    monkeypatch.setattr(
        "routes.analyze.get_similarity",
        lambda sentence, passage: next(similarities),
    )
    monkeypatch.setattr("routes.analyze.is_suspicious", lambda score: score < 0.35)
    monkeypatch.setattr(
        "routes.analyze.judge_sentences",
        lambda passage, question, sentences, similarity_scores: [
            SentenceResult(
                sentence=sentences[0],
                verdict="partial",
                explanation="Needs judge review.",
                confidence=0.71,
                critical=False,
                similarity_score=round(similarity_scores[0], 2),
            )
        ],
    )

    response = client.post(
        "/analyze",
        json={
            "passage": "Source passage.",
            "question": "What happened?",
            "ai_response": "Supported sentence here. Suspicious claim appears here.",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert [item["sentence"] for item in payload["sentences"]] == [
        "Supported sentence here.",
        "Suspicious claim appears here.",
    ]
    assert payload["sentences"][0]["verdict"] == "faithful"
    assert payload["sentences"][1]["verdict"] == "partial"


def test_analyze_rejects_responses_without_usable_sentences() -> None:
    response = client.post(
        "/analyze",
        json={
            "passage": "Source passage.",
            "question": "",
            "ai_response": "short",
        },
    )

    assert response.status_code == 422
    assert "at least one sentence" in response.json()["detail"]
