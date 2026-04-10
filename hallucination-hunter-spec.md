# Hallucination Hunter — Full Developer Specification

## Project Overview

A web app that detects whether an AI response is faithful, hallucinated, drifting, or partially faithful relative to a source passage. The system uses a two-stage hybrid pipeline: lightweight similarity pre-filtering followed by a judge LLM that evaluates factual accuracy AND contextual relevance simultaneously.

---

## Tech Stack

```
frontend/          React + Vite + TailwindCSS
backend/           Python + FastAPI
nlp/               sentence-transformers (all-MiniLM-L6-v2)
judge/             Anthropic Claude API (claude-sonnet-4-20250514)
```

No database needed for MVP. Everything is stateless per-request.

---

## Folder Structure

```
hallucination-hunter/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routes/
│   │   └── analyze.py           # POST /analyze endpoint
│   ├── services/
│   │   ├── splitter.py          # Sentence splitting logic
│   │   ├── embedder.py          # Embedding + cosine similarity
│   │   └── judge.py             # Claude API judge call
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   ├── utils/
│   │   └── aggregator.py        # Combine sentence results → final verdict
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── InputPanel.jsx       # Passage + question + AI response inputs
│   │   │   ├── ResultsPanel.jsx     # Overall verdict + confidence bar
│   │   │   ├── SentenceCard.jsx     # Per-sentence verdict row
│   │   │   ├── VerdictBadge.jsx     # Reusable colored badge
│   │   │   ├── ConfidenceBar.jsx    # Animated progress bar
│   │   │   ├── MetricStrip.jsx      # Sentence count / issues / faithful
│   │   │   ├── ExampleLoader.jsx    # Pre-loaded demo examples
│   │   │   └── LoadingSkeleton.jsx  # Streaming loading state per sentence
│   │   ├── hooks/
│   │   │   └── useAnalysis.js       # API call + state management
│   │   ├── constants/
│   │   │   ├── examples.js          # 5 demo examples hardcoded
│   │   │   └── verdicts.js          # Verdict labels, colors, descriptions
│   │   ├── utils/
│   │   │   └── formatters.js        # Score formatting, text truncation
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env                         # ANTHROPIC_API_KEY
└── README.md
```

---

## Backend — Full Specification

### `schemas.py`

```python
class AnalyzeRequest:
    passage: str          # ground truth source
    question: str         # optional, user's original question
    ai_response: str      # the AI output to evaluate

class SentenceResult:
    sentence: str
    verdict: Literal["faithful", "hallucinated", "drifting", "partial", "unverifiable"]
    explanation: str
    confidence: float     # 0.0 to 1.0
    critical: bool        # true = core factual error, overrides overall verdict
    similarity_score: float  # from embedding stage

class AnalyzeResponse:
    overall_verdict: str
    overall_confidence: float
    summary: str
    sentences: List[SentenceResult]
    stats: dict           # total, issues, faithful, drifting, critical_count
```

---

### `splitter.py` — Sentence Splitting

Use `nltk.sent_tokenize` or regex fallback.

Rules:
- Minimum sentence length: 10 characters
- Strip leading/trailing whitespace
- Preserve original sentence text exactly (used for highlighting)
- Handle abbreviations (Dr., Mr., etc.) — nltk handles this

```python
def split_sentences(text: str) -> List[str]:
    # use nltk.sent_tokenize
    # filter len > 10
    # return list of strings
```

---

### `embedder.py` — Similarity Pre-Filter

Model: `all-MiniLM-L6-v2` (fast, lightweight, runs locally)

Logic:

```python
def get_similarity(sentence: str, passage: str) -> float:
    # encode both with sentence-transformers
    # return cosine similarity score (0.0 to 1.0)

SIMILARITY_THRESHOLD = 0.35
# above threshold → mark as "safe", skip LLM call
# below threshold → mark as "suspicious", send to LLM judge
```

Why 0.35: tuned to catch factual deviations without too many false positives. Expose this as a configurable parameter.

---

### `judge.py` — Claude LLM Judge

This is the core intelligence. Send ALL suspicious sentences in ONE API call (batch, not one call per sentence — saves cost and latency).

**System prompt:**

```
You are a hallucination and relevance detection engine.

Given a source passage, an optional user question, and a list of AI response sentences, evaluate each sentence.

For each sentence return:
- verdict: faithful | hallucinated | drifting | partial | unverifiable
- explanation: one concise sentence explaining why
- confidence: float 0.0–1.0
- critical: true if this sentence contains a core factual error

Verdict definitions:
- faithful: supported by passage AND relevant to question
- hallucinated: contradicts or is completely absent from passage
- drifting: may be true but doesn't address the question (relevance failure)
- partial: partially supported but contains unsupported elements
- unverifiable: cannot be confirmed from passage alone

Return ONLY a valid JSON array. No markdown. No preamble.
```

**User message format:**

```
Passage: """..."""

User question: "..."

Sentences to evaluate:
1. "..."
2. "..."
3. "..."
```

Parse response → map back to original sentence list by index.

---

### `aggregator.py` — Final Verdict Logic

```python
def aggregate(sentence_results) -> dict:
    total = len(sentence_results)
    issues = count where verdict != "faithful"
    issue_ratio = issues / total

    # Critical override
    if any(s.critical for s in results):
        overall = "hallucinated"

    # Ratio thresholds
    elif issue_ratio >= 0.4:
        overall = "hallucinated"
    elif issue_ratio > 0:
        # check if issues are mostly drifting vs hallucinated
        if drift_count > hallucination_count:
            overall = "drifting"
        else:
            overall = "partial"
    else:
        overall = "faithful"

    confidence = 1.0 - (issue_ratio * 0.8)
    return overall, confidence
```

---

### `analyze.py` — Main Route

```
POST /analyze
Content-Type: application/json

Flow:
1. Receive AnalyzeRequest
2. Split ai_response into sentences
3. For each sentence: compute similarity score vs passage
4. Sentences below threshold → send to judge LLM (batch)
5. Sentences above threshold → auto-mark as "faithful", confidence = similarity_score
6. Merge all results back into original sentence order
7. Run aggregator → overall verdict
8. Return AnalyzeResponse
```

CORS: allow `http://localhost:5173` for dev.

---

## Frontend — Full Specification

### Component Hierarchy

```
App
├── InputPanel
│   ├── textarea: passage
│   ├── textarea: question (optional)
│   ├── textarea: ai_response
│   ├── AnalyzeButton
│   └── ExampleLoader (5 examples)
│
└── ResultsPanel (shown after response)
    ├── MetricStrip (total / issues / faithful)
    ├── VerdictBadge (overall)
    ├── ConfidenceBar (animated)
    ├── SummaryText
    └── SentenceList
        └── SentenceCard × N
            ├── sentence text (color highlighted)
            ├── VerdictBadge (per sentence)
            ├── explanation text
            └── similarity score indicator
```

---

### Color System

| Verdict | Background | Border | Text |
|---|---|---|---|
| faithful | green-50 | green-400 | green-900 |
| hallucinated | red-50 | red-400 | red-900 |
| drifting | purple-50 | purple-400 | purple-900 |
| partial | amber-50 | amber-400 | amber-900 |
| unverifiable | gray-50 | gray-400 | gray-600 |

---

### `useAnalysis.js` Hook

```javascript
state: {
  status: 'idle' | 'loading' | 'success' | 'error',
  data: AnalyzeResponse | null,
  error: string | null
}

async function analyze({ passage, question, aiResponse }):
  → POST http://localhost:8000/analyze
  → set loading
  → on success: set data
  → on error: set error message
```

---

### `examples.js` — 5 Demo Examples

Include these 5 pre-built demos so judges/users can test without typing:

1. Cricket World Cup 2011 — drift detection demo
2. French Revolution — date hallucination
3. James Webb Telescope — mixed result
4. Climate change — accurate response
5. Made-up medical claim — hallucination stress test

---

### UX Behaviour

- Analyze button disabled while loading
- Each sentence card animates in sequentially (staggered 80ms delay) as if streaming
- Overall verdict card appears after all sentences render
- On mobile: stack inputs vertically, sentence cards full width
- Clear button resets everything including results
- Hovering a sentence card highlights it with a subtle border lift
- Confidence bar animates from 0 to final value on mount

---

## API Contract

**Request:**

```json
POST /analyze
{
  "passage": "string",
  "question": "string (optional, empty string ok)",
  "ai_response": "string"
}
```

**Response:**

```json
{
  "overall_verdict": "faithful|hallucinated|drifting|partial",
  "overall_confidence": 0.87,
  "summary": "The response contains one critical factual error...",
  "sentences": [
    {
      "sentence": "India won the 2011 World Cup.",
      "verdict": "faithful",
      "explanation": "Directly supported by the passage.",
      "confidence": 0.94,
      "critical": false,
      "similarity_score": 0.82
    }
  ],
  "stats": {
    "total": 5,
    "issues": 2,
    "faithful": 3,
    "drifting": 1,
    "critical_count": 0
  }
}
```

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
SIMILARITY_THRESHOLD=0.35        # tunable
CORS_ORIGIN=http://localhost:5173
```

---

## Build & Run

```bash
# Backend
cd backend
pip install fastapi uvicorn sentence-transformers anthropic nltk pydantic python-dotenv
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm create vite@latest . -- --template react
npm install tailwindcss axios
npm run dev
```

---

## Key Design Decisions

1. **Embedding filter runs first** — only suspicious sentences go to the LLM. Keeps it fast and cheap.
2. **One batch LLM call** — all suspicious sentences sent together, not one call per sentence.
3. **Question injected every time** — the judge always gets the original user question. This is what enables drift detection.
4. **Critical flag overrides everything** — `critical: true` on any sentence = immediate hallucinated verdict regardless of ratios.
5. **Auto-faithful above threshold** — sentences above similarity threshold are marked faithful without an LLM call.
6. **Drifting is its own verdict** — distinct from hallucinated. Catches relevance failure, not just factual errors. A response can be 100% factually true and still be drifting.
7. **Staggered animation on frontend** — results appear sentence by sentence with 80ms delay, feels like streaming even though it's a single API response.

---

## The 5 Verdict Types Explained

| Verdict | Meaning | Example |
|---|---|---|
| ✅ Faithful | Supported by passage, relevant to question | "India won in 2011" when passage confirms this |
| ❌ Hallucinated | Contradicts or absent from passage | "Dhoni scored 150 runs" when passage says 91 |
| 🟣 Drifting | True but doesn't answer the question | "Cricket is played with a bat" when asked about the score |
| 🟡 Partial | Mix of supported and unsupported claims | "India won, scoring 300 runs" when actual score was 277 |
| ⬜ Unverifiable | Passage doesn't have enough info to confirm | Future predictions, opinions not in passage |
