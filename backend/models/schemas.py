from typing import Literal

from pydantic import BaseModel, Field, field_validator


Verdict = Literal["faithful", "hallucinated", "drifting", "partial", "unverifiable"]
OverallVerdict = Literal["faithful", "hallucinated", "drifting", "partial"]


class ResponseStats(BaseModel):
    total: int = Field(ge=0)
    issues: int = Field(ge=0)
    faithful: int = Field(ge=0)
    drifting: int = Field(ge=0)
    critical_count: int = Field(ge=0)


class AnalyzeRequest(BaseModel):
    passage: str = Field(..., min_length=1)
    question: str = ""
    ai_response: str = Field(..., min_length=1)

    @field_validator("passage", "question", "ai_response", mode="before")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        if value is None:
            return ""
        if not isinstance(value, str):
            raise TypeError("Expected a string input.")
        return value.strip()


class SentenceResult(BaseModel):
    sentence: str
    verdict: Verdict
    explanation: str
    confidence: float = Field(ge=0.0, le=1.0)
    critical: bool
    similarity_score: float = Field(ge=0.0, le=1.0)

    @field_validator("sentence", "explanation", mode="before")
    @classmethod
    def require_non_empty_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise TypeError("Expected a string value.")
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be empty.")
        return normalized


class AnalyzeResponse(BaseModel):
    overall_verdict: OverallVerdict
    overall_confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    sentences: list[SentenceResult]
    stats: ResponseStats
