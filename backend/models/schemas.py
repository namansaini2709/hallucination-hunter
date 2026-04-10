from typing import Literal

from pydantic import BaseModel, Field


Verdict = Literal["faithful", "hallucinated", "drifting", "partial", "unverifiable"]


class AnalyzeRequest(BaseModel):
    passage: str = Field(..., min_length=1)
    question: str = ""
    ai_response: str = Field(..., min_length=1)


class SentenceResult(BaseModel):
    sentence: str
    verdict: Verdict
    explanation: str
    confidence: float
    critical: bool
    similarity_score: float


class AnalyzeResponse(BaseModel):
    overall_verdict: Literal["faithful", "hallucinated", "drifting", "partial"]
    overall_confidence: float
    summary: str
    sentences: list[SentenceResult]
    stats: dict[str, int]
