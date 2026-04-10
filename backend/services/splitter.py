import re


SENTENCE_REGEX = re.compile(r"(?<=[.!?])\s+")


def split_sentences(text: str) -> list[str]:
    raw_parts = SENTENCE_REGEX.split(text.strip())
    return [part.strip() for part in raw_parts if len(part.strip()) >= 10]
