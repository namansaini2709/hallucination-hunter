# AI Handoff Context

This file is a full-context handoff for any future AI or engineer working in this repository.

It summarizes:

- what the project is
- what has already been built
- what changed during this chat
- the current backend and frontend state
- Git branch context
- known mismatches and open issues
- how to continue work without rereading the whole conversation

## Project Summary

Project name: `Hallucination Hunter`

Purpose:

Hallucination Hunter is a source-grounded AI answer auditing product. It takes:

- a source passage
- an optional user question
- an AI-generated answer

Then it returns:

- sentence-level verdicts
- explanations
- similarity scores
- an overall verdict
- confidence and summary stats

Core verdicts:

- `faithful`
- `hallucinated`
- `drifting`
- `partial`
- `unverifiable`

The intended value proposition is:

- detect unsupported claims
- detect question drift
- present explainable sentence-level evidence

## Current Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- `react-router-dom`
- Three.js via:
  - `three`
  - `@react-three/fiber`
  - `@react-three/drei`

### Backend

- FastAPI
- Pydantic
- `sentence-transformers`
- `nltk`
- Groq API for judge calls

## Important Repo Reality

Some documentation is outdated.

### Accurate files

- `backend-work-split.md`
- backend code under `backend/`
- current frontend code under `frontend/`

### Outdated / partially outdated files

- `README.md`
  - still mentions Anthropic in some places
  - still describes the repo as a scaffold in a few sections
  - should not be treated as the final source of truth

If there is a conflict:

1. trust the actual code first
2. trust `backend-work-split.md` over `README.md`

## Backend Status

Backend is effectively complete for the MVP.

### Track A status

Track A was completed in this chat.

Track A includes:

- FastAPI app setup
- request/response schema tightening
- sentence splitting
- similarity threshold handling
- embedding-based similarity module
- route orchestration
- Track A tests

Key Track A files:

- `backend/main.py`
- `backend/routes/analyze.py`
- `backend/models/schemas.py`
- `backend/services/splitter.py`
- `backend/services/embedder.py`

### Track B status

Track B is also effectively complete for the MVP.

Track B includes:

- Groq-based judge integration
- prompt and user payload format
- JSON parsing and fallback logic
- aggregator logic
- summary generation
- reasoning-layer tests

Key Track B files:

- `backend/services/judge.py`
- `backend/utils/aggregator.py`

### Backend verification completed in this chat

The backend test suite passed at one point during this chat:

- `15 passed`

The backend was considered completed for both tracks after that test run.

### Backend env/config notes

Backend uses env vars from:

- `backend/.env.example`

Relevant keys include:

- `SIMILARITY_THRESHOLD`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_API_BASE_URL`
- `CORS_ORIGIN`

### Important backend docs

- `backend-work-split.md` is the best backend ownership/context file

## Frontend Status

Frontend is in active design iteration and is the main unfinished area.

### Current routing structure

The frontend now uses routing:

- `/` = landing page
- `/analyze` = analysis workspace

Important frontend files:

- `frontend/src/App.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/AnalyzePage.jsx`
- `frontend/src/components/HeroCube.jsx`
- `frontend/src/styles.css`

### Analysis page

The `/analyze` page is a functional workspace page that:

- lets users input the passage
- question
- AI response
- call the backend
- show results

This route should be preserved.

### Landing page direction

The landing page changed several times during this chat.

The user explicitly rejected the earlier “presentation / product sections” version and wanted something that matches their uploaded visual inspiration much more closely.

### What the user wants for the landing page

The user wants the landing page to be:

- a single premium hero page
- extremely close to the uploaded reference screenshots
- poster-like, not a normal SaaS landing page
- minimal UI chrome
- dominated by:
  - massive layered typography
  - a sculpted central cube
  - dark premium background
  - subtle grid/texture/depth

### Specific frontend feedback from the user

The user explicitly said:

- current frontend looked more like a presentation than a website
- wanted a proper landing page first, then a separate page for analysis
- later wanted the landing page to match uploaded screenshots much more literally
- wanted:
  - `Get Started` button
  - separate analysis page after clicking it
- later said the design was “nowhere near the inspo”
- explicitly asked to remove:
  - `CHAOTIC 4`
  - `LIE DETECTOR`
  - `For DomAlyn Labs...`
  - borders / extra framing
- explicitly asked for:
  - same single page feel as the inspo
- explicitly asked to:
  - reduce cube size
  - make it match screenshot proportions
  - stop constant rotation
  - use a subtle oscillation instead
  - keep shadow from showing too much

### Current landing page state

The current landing page is much closer to the user’s latest direction than earlier versions, but it is still likely not final.

The latest direction implemented:

- stripped down to a single full-screen hero page
- removed extra labels and hero border
- made the page feel more like a single poster
- made the cube smaller
- changed motion from continuous spin to subtle oscillation

### Current likely gap

Even after the latest adjustments, the most likely remaining gap is still:

- exact art-direction fidelity to the uploaded screenshots

Especially:

- exact cube proportions
- exact text overlap
- exact warm cream/orange material finish
- exact relative size and position of cube vs title

## Uploaded Screenshots Context

The user uploaded screenshots locally in `uploads/` during this chat.

Important:

- those screenshots were intentionally not committed/pushed
- they remain local-only reference material

Current local-only folder:

- `uploads/`

This folder is currently untracked in Git.

Use it as design reference only unless the user explicitly asks to commit it.

## Git / Branch Context

### Branch state during this chat

The repo started with:

- local `master`

Later:

- `main` was created and pushed
- work was also pushed to remote `master`

### Current relevant branch state at time of writing

Local branch:

- `main`

Remote branch used frequently in this chat:

- `origin/master`

### Important recent Git actions performed in this chat

1. project scaffold was initialized and pushed
2. Track A backend work was completed and pushed
3. remote `master` was pulled into local work multiple times
4. local frontend work was preserved while pulling `master`
5. current frontend landing-page work was pushed to remote `master`

### Recent visible commit chain at time of writing

Recent commits included:

- `e5ba068` `Refine premium landing experience`
- `ecfecc2` `Merge pull request #4 from namansaini2709/atharv`
- `746146f` `ai working`
- `b3f584d` `Merge pull request #3 from namansaini2709/atharv`

This means:

- current local `main` includes the latest pulled `master` content plus local work
- remote `master` was updated with the latest frontend landing-page changes

## Current Working Tree State

At the moment this file is being created:

- `uploads/` is still untracked

That is expected and intentional.

Do not assume the screenshots should be committed.

## Important File Map

### Backend

- `backend/main.py`
- `backend/routes/analyze.py`
- `backend/models/schemas.py`
- `backend/services/splitter.py`
- `backend/services/embedder.py`
- `backend/services/judge.py`
- `backend/utils/aggregator.py`
- `backend/tests/`
- `backend/.env.example`
- `backend-work-split.md`

### Frontend

- `frontend/src/App.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/AnalyzePage.jsx`
- `frontend/src/components/HeroCube.jsx`
- `frontend/src/components/ExampleLoader.jsx`
- `frontend/src/styles.css`
- `frontend/src/hooks/useAnalysis.js`

## Design Intent Summary For Future AI

If you continue the frontend work, follow these rules:

1. Do not turn the landing page back into a conventional SaaS site with many stacked sections unless the user explicitly asks for that again.
2. Preserve the separate `/analyze` route.
3. Treat the uploaded screenshots as the landing-page reference.
4. Prioritize exact visual fidelity over generic “clean modern UI”.
5. The hero should feel:
   - premium
   - poster-like
   - minimal
   - cinematic
   - art-directed
6. Keep the cube motion subtle.
7. Avoid large UI chrome on the landing hero.
8. Keep the dark warm theme already established.

## Recommended Next Steps

If another AI continues from here, the best next actions are:

1. Open the latest image in `uploads/`.
2. Compare it against the current `frontend/src/pages/LandingPage.jsx` and `frontend/src/components/HeroCube.jsx`.
3. Tune:
   - cube size
   - cube pose
   - cube material
   - exact text/cube overlap
   - spacing and proportions
4. Keep `/analyze` stable and functional.
5. Do not touch backend unless the user asks.

## Commands Previously Used Successfully

Frontend:

```powershell
cd frontend
npm install
npm run dev
npm run build
```

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
python -m pytest tests -p no:cacheprovider
```

## Final Handoff Summary

Backend:

- complete enough for MVP
- Track A complete
- Track B complete
- tested successfully during this chat

Frontend:

- routing and analysis flow established
- landing page still under high-fidelity visual iteration
- latest work pushed to remote `master`
- screenshots remain local-only references in `uploads/`

If a future AI needs one sentence of guidance:

Keep the backend stable, preserve `/analyze`, and keep iterating on the landing hero until it matches the uploaded poster-style reference more literally.
