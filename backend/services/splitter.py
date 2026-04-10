import re
from functools import lru_cache

from nltk import data
from nltk.tokenize import sent_tokenize

SENTENCE_REGEX = re.compile(r"(?<=[.!?])\s+")
MIN_SENTENCE_LENGTH = 10


def split_sentences(text: str) -> list[str]:
    normalized_text = text.strip()
    if not normalized_text:
        return []

    raw_parts = _tokenize_sentences(normalized_text)
    return [part for part in raw_parts if len(part.strip()) >= MIN_SENTENCE_LENGTH]


def _tokenize_sentences(text: str) -> list[str]:
    if _punkt_tokenizer_available():
        try:
            return [sentence for sentence in sent_tokenize(text) if sentence.strip()]
        except LookupError:
            pass

    return [part for part in SENTENCE_REGEX.split(text) if part.strip()]


@lru_cache(maxsize=1)
def _punkt_tokenizer_available() -> bool:
    try:
        data.find("tokenizers/punkt")
        return True
    except LookupError:
        return False
