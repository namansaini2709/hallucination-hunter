from services import splitter


def test_split_sentences_uses_regex_fallback_when_punkt_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(splitter, "_punkt_tokenizer_available", lambda: False)

    result = splitter.split_sentences(
        "First sentence is long enough. Second sentence also works! Tiny"
    )

    assert result == [
        "First sentence is long enough.",
        "Second sentence also works!",
    ]


def test_split_sentences_filters_short_fragments(monkeypatch) -> None:
    monkeypatch.setattr(splitter, "_punkt_tokenizer_available", lambda: False)

    result = splitter.split_sentences("Short. This sentence is definitely valid.")

    assert result == ["This sentence is definitely valid."]


def test_split_sentences_handles_missing_space_after_punctuation(monkeypatch) -> None:
    monkeypatch.setattr(splitter, "_punkt_tokenizer_available", lambda: False)

    result = splitter.split_sentences(
        "Launched by NASA, ESA, and CSA).It is often described as Hubble's successor."
    )

    assert result == [
        "Launched by NASA, ESA, and CSA).",
        "It is often described as Hubble's successor.",
    ]
