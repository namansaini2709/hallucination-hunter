import os
from difflib import SequenceMatcher


SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.35"))


def get_similarity(sentence: str, passage: str) -> float:
    # Placeholder until sentence-transformers is wired in.
    return SequenceMatcher(None, sentence.lower(), passage.lower()).ratio()


def is_suspicious(score: float) -> bool:
    return score < SIMILARITY_THRESHOLD
