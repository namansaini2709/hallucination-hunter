import os
from functools import lru_cache

from sentence_transformers import SentenceTransformer, util


DEFAULT_THRESHOLD = 0.92
MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")


def get_similarity(sentence: str, passage: str) -> float:
    model = get_embedding_model()
    embeddings = model.encode([sentence, passage], convert_to_tensor=True)
    score = util.cos_sim(embeddings[0], embeddings[1]).item()
    return _normalize_similarity(score)


def get_similarity_threshold() -> float:
    return _read_threshold("SIMILARITY_THRESHOLD", default=DEFAULT_THRESHOLD)


def is_suspicious(score: float) -> bool:
    return score < get_similarity_threshold()


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
