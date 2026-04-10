# Hallucination Hunter

Hallucination Hunter is a source-grounded AI response auditor. It compares an AI answer against a reference passage, classifies each sentence, and returns an overall verdict with a confidence score.

## Structure

```text
backend/   FastAPI API for splitting, scoring, judging, and aggregating
frontend/  React + Vite UI for input, examples, and sentence-level results
```

## Current State

This repo is initialized with a working scaffold:

- FastAPI app with `POST /analyze` and `GET /health`
- Pydantic schemas for request and response payloads
- Placeholder similarity scoring and placeholder judge logic
- React UI with example loaders, analysis form, and results panel
- Local setup instructions for both services

The placeholder backend is enough to wire the frontend and start parallel work, but it is not the final judging implementation from the spec.

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Copy `.env.example` to `.env` if you want to override the default threshold, embedding model, or allowed CORS origin.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:8000`.

## Suggested Next Build Steps

1. Replace the placeholder similarity scorer with `sentence-transformers`.
2. Replace the placeholder judge with a real Anthropic batch judge call.
3. Add stronger validation, test coverage, and error handling.
4. Add staggered sentence rendering and richer verdict explanations.

## Backend Split For Two People

### Backend Track A: API + Preprocessing

Own these paths:

- `backend/main.py`
- `backend/routes/analyze.py`
- `backend/services/splitter.py`
- `backend/services/embedder.py`
- `backend/models/schemas.py`

Responsibilities:

- request validation and response stability
- real sentence splitting with `nltk`
- embedding model integration
- similarity threshold config
- backend tests for input/output contract

### Backend Track B: Judging + Aggregation

Own these paths:

- `backend/services/judge.py`
- `backend/utils/aggregator.py`

Responsibilities:

- Anthropic batch judge integration
- prompt design and JSON parsing
- verdict consistency rules
- critical error override logic
- summary generation and confidence tuning

### Frontend Track

Own these paths:

- `frontend/src/App.jsx`
- `frontend/src/components/`
- `frontend/src/hooks/`
- `frontend/src/constants/`
- `frontend/src/utils/`

Responsibilities:

- immersive UI and responsive behavior
- loading states and staggered rendering
- stronger error and empty states
- verdict visuals and confidence animations
- integration against the stable backend contract

## Coordination Rules

1. Treat the request/response schema as the shared contract.
2. Backend Track A owns the API schema and must announce any contract changes.
3. Backend Track B should develop against the schema owned by Track A.
4. Frontend should use mock responses until the real judge lands.
5. Merge backend tracks first, then do full frontend integration.
