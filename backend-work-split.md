# Backend Work Split

This file explains how to divide the backend between two people without causing merge conflicts or unclear ownership.

The backend has been split into two tracks:

- `Track A`: API contract and preprocessing
- `Track B`: LLM judging and verdict aggregation

Both tracks should agree on the shared request/response schema before making major changes.

## Backend Goal

The backend takes:

- a source passage
- an optional user question
- an AI response

It returns:

- sentence-level verdicts
- explanations
- confidence scores
- an overall verdict
- summary statistics

The target flow is:

1. Receive request
2. Split AI response into sentences
3. Compute similarity between each sentence and the passage
4. Send suspicious sentences to the judge model
5. Merge judged and auto-passed sentences
6. Aggregate sentence-level results into one final verdict
7. Return the final API response

## Track A: API + Preprocessing

### Main Responsibility

Track A owns the backend foundation. This track is responsible for everything needed to accept requests, prepare data, and pass structured inputs into the judging stage.

### Owned Files

- `backend/main.py`
- `backend/routes/analyze.py`
- `backend/models/schemas.py`
- `backend/services/splitter.py`
- `backend/services/embedder.py`
- `backend/requirements.txt`

### What This Person Should Build

1. FastAPI app setup
   - keep `GET /health`
   - keep `POST /analyze`
   - configure CORS cleanly
   - make sure the app runs locally without hacks

2. Request and response schema stability
   - finalize `AnalyzeRequest`
   - finalize `SentenceResult`
   - finalize `AnalyzeResponse`
   - enforce validation with Pydantic
   - make sure frontend can depend on this contract

3. Sentence splitting
   - replace regex-only placeholder if needed
   - use `nltk.sent_tokenize` with fallback
   - preserve original sentence text
   - filter very short fragments
   - handle empty or malformed responses safely

4. Similarity stage
   - replace placeholder similarity with `sentence-transformers`
   - load `all-MiniLM-L6-v2`
   - compute cosine similarity
   - expose `SIMILARITY_THRESHOLD` from environment
   - keep this stage fast and deterministic

5. Analyze route orchestration
   - maintain sentence order
   - mark high-similarity sentences as safe
   - prepare suspicious sentences for Track B judge
   - merge judged results back into the original list
   - return valid API response every time

6. Backend tests for API contract
   - test valid request shape
   - test missing field validation
   - test empty response handling
   - test sentence ordering
   - test threshold behavior

### Deliverables For Track A

- stable FastAPI backend entry point
- real sentence splitter
- real embedding similarity module
- production-ready request/response schema
- route logic that passes clean structured data to Track B

### Risks This Person Must Watch

- changing schema without telling Track B or frontend
- silently reordering sentences
- embedding model load failures
- poor handling of empty or tiny sentences
- making the similarity stage too slow for local demo use

## Track B: Judging + Aggregation

### Main Responsibility

Track B owns the intelligence layer. This track is responsible for deciding what suspicious sentences mean and how sentence-level issues become the final response verdict.

### Owned Files

- `backend/services/judge.py`
- `backend/utils/aggregator.py`

### What This Person Should Build

1. Anthropic judge integration
   - connect to Anthropic API
   - use one batch call for suspicious sentences
   - pass passage, optional question, and sentence list
   - request strict JSON output only
   - handle malformed model output safely

2. Judge prompt design
   - clearly define all verdict labels
   - distinguish `hallucinated` vs `partial`
   - distinguish `hallucinated` vs `drifting`
   - mark `critical` when a sentence contains a core factual error
   - keep explanations short and useful

3. Judge response parsing
   - map output back to original sentence positions
   - validate verdict labels
   - clamp confidence into expected range
   - provide safe fallback if the model response is broken

4. Aggregation logic
   - implement critical override
   - compute issue counts
   - compute overall verdict
   - compute overall confidence
   - produce a clean summary string for the frontend

5. Verdict tuning
   - make sure verdict rules are consistent
   - avoid classifying everything as hallucinated
   - avoid weak summaries
   - keep `drifting` meaningful as a separate category

6. Backend tests for reasoning layer
   - test critical override
   - test issue-ratio thresholds
   - test mixed verdict scenarios
   - test broken judge output fallback
   - test summary generation

### Deliverables For Track B

- working Anthropic batch judge integration
- stable JSON parsing and fallback logic
- final aggregation rules
- useful sentence explanations
- reliable overall verdict and summary generation

### Risks This Person Must Watch

- model output not matching expected JSON
- inconsistent use of verdict labels
- hallucination and drifting logic overlapping too much
- too much prompt complexity
- aggregation rules that feel arbitrary to users

## Shared Contract Between Track A and Track B

These are the fields both tracks should align on before heavy implementation:

### Request

```json
{
  "passage": "string",
  "question": "string",
  "ai_response": "string"
}
```

### Sentence Result

```json
{
  "sentence": "string",
  "verdict": "faithful | hallucinated | drifting | partial | unverifiable",
  "explanation": "string",
  "confidence": 0.0,
  "critical": false,
  "similarity_score": 0.0
}
```

### Response

```json
{
  "overall_verdict": "faithful | hallucinated | drifting | partial",
  "overall_confidence": 0.0,
  "summary": "string",
  "sentences": [],
  "stats": {
    "total": 0,
    "issues": 0,
    "faithful": 0,
    "drifting": 0,
    "critical_count": 0
  }
}
```

## How The Two People Should Work

### Recommended Order

1. Track A finalizes schemas and route shape.
2. Track B codes against that schema.
3. Track A wires preprocessing into the route.
4. Track B wires the real judge and aggregator.
5. Both tracks test together using the same sample requests.

### Coordination Rules

1. Track A owns the schema and route-level payload format.
2. Track B should not change API fields without discussing it first.
3. If Track B needs extra fields, propose them before implementing.
4. Both people should use the same example payloads during testing.
5. Do integration only after each track works independently.

## Suggested Task Checklist

### Track A Checklist

- [ ] Install and verify FastAPI dependencies
- [ ] Finalize Pydantic schemas
- [ ] Add `nltk`-based sentence splitting
- [ ] Add embedding model loading
- [ ] Add cosine similarity scoring
- [ ] Add threshold config from `.env`
- [ ] Update `POST /analyze` route flow
- [ ] Add API and preprocessing tests

### Track B Checklist

- [ ] Add Anthropic client integration
- [ ] Write system prompt and user payload format
- [ ] Parse model JSON safely
- [ ] Validate sentence-level verdicts
- [ ] Finalize aggregation rules
- [ ] Generate overall summary text
- [ ] Add reasoning and aggregation tests

## Final Merge Target

The finished backend should be able to:

- accept one analysis request
- split and score the response sentence by sentence
- judge only suspicious sentences
- produce detailed sentence-level findings
- return a reliable overall verdict for frontend display
