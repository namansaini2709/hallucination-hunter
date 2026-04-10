import os
from functools import lru_cache
from typing import Literal

from sentence_transformers import SentenceTransformer, util


DEFAULT_SUSPICIOUS_THRESHOLD = 0.45
DEFAULT_SAFE_THRESHOLD = 0.72
MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
SimilarityZone = Literal["suspicious", "gray", "safe"]


def get_similarity(sentence: str, passage: str) -> float:
    model = get_embedding_model()
    embeddings = model.encode([sentence, passage], convert_to_tensor=True)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    return _normalize_similarity(score)


def get_similarity_thresholds() -> tuple[float, float]:
    # Legacy compatibility: if only SIMILARITY_THRESHOLD is set, treat it as safe threshold.
    legacy = _read_threshold("SIMILARITY_THRESHOLD", default=None)
    suspicious = _read_threshold("SUSPICIOUS_THRESHOLD", default=None)
    safe = _read_threshold("SAFE_THRESHOLD", default=None)

    if safe is None and legacy is not None:
        safe = legacy
    if suspicious is None and legacy is not None:
        suspicious = max(0.0, legacy - 0.1)

    suspicious = DEFAULT_SUSPICIOUS_THRESHOLD if suspicious is None else suspicious
    safe = DEFAULT_SAFE_THRESHOLD if safe is None else safe

    if suspicious > safe:
        suspicious, safe = safe, suspicious

    return suspicious, safe


def is_suspicious(score: float) -> bool:
    # In the 3-zone gate, both low-score and gray-zone sentences go to judge.
    return classify_similarity(score) != "safe"


def classify_similarity(score: float) -> SimilarityZone:
    suspicious_threshold, safe_threshold = get_similarity_thresholds()
    if score <= suspicious_threshold:
        return "suspicious"
    if score >= safe_threshold:
        return "safe"
    return "gray"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def _normalize_similarity(score: float) -> float:
    # Cosine similarity can be in [-1, 1]; the API contract expects [0, 1].
    bounded = (score + 1) / 2
    return min(max(bounded, 0.0), 1.0)


def _read_threshold(name: str, default: float | None) -> float | None:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return min(max(float(raw), 0.0), 1.0)
    except ValueError:
        return default
