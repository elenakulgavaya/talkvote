# TalkVote

Demo application for the talk **"From E2E to Contract Tests: A Practical Migration Path Beyond Microservices"** (SeeTestConf).

TalkVote is a conference talk voting board used to demonstrate migrating from E2E tests to contract tests.

---

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://elenakulgavaya.github.io/talkvote/ |
| Backend  | *(set after Render deploy — update this line)* |

---

## Repository structure

```
talkvote/
  src/
    frontend/          # React + TypeScript + Vite
    backend/           # Node.js + Express + TypeScript (in-memory store)
  tests/
    e2e/               # Playwright E2E tests (full-stack)
    contracts/         # OpenAPI schema + frontend contract tests (Prism mock)
  .github/workflows/
    e2e.yml                 # Full E2E pipeline (slow, demonstrates the problem)
    deploy-frontend.yml     # Deploy to GitHub Pages on push to main
    contract-backend.yml    # Backend contract: schemathesis vs openapi.yaml
    contract-frontend.yml   # Frontend contract: vitest vs Prism mock
```

---

## Quick start (local)

### Backend

```bash
cd src/backend
cp .env.example .env
npm install
npm run dev        # http://localhost:3001
```

### Frontend

```bash
cd src/frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm install
npm run dev        # http://localhost:5173
```

### E2E tests (local — starts both servers automatically)

```bash
cd tests/e2e
npm install
npx playwright install chromium
npx playwright test --headed
```

### Contract tests (frontend — requires Prism mock)

```bash
cd tests/contracts
npm install
npx @stoplight/prism-cli mock openapi.yaml --port 4010 &
PRISM_URL=http://localhost:4010 npx vitest run frontend-tests
```

---

## Data model

```typescript
interface Talk {
  id: string;
  title: string;
  speakerName: string;
  abstract: string;
  track: "frontend" | "backend" | "qa" | "devops";
  level: "beginner" | "intermediate" | "advanced";
  status: "submitted" | "approved" | "rejected";
  votes: number;
  createdAt: string; // ISO 8601
}
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/talks` | List talks (filter by `track`, `level`, `status`; `sort=votes`) |
| GET | `/api/talks/:id` | Talk detail |
| POST | `/api/talks` | Submit a talk |
| POST | `/api/talks/:id/vote` | Vote (header: `X-Voter-Id`) |
| PATCH | `/api/talks/:id/status` | Admin: approve/reject |

---

## Breaking change branches (Step 5)

These branches are prepared for the demo. **Do not merge to main.**

| Branch | Change | How it breaks |
|--------|--------|---------------|
| `demo/break-votes-shape` | `votes: number` → `votes: { count: number, average: number }` | Frontend shows `[object Object]` instead of vote count |
| `demo/break-status-enum` | `"approved"` → `"accepted"` in backend responses | Approved talks silently vanish from the filtered list |
| `demo/break-required-field` | Backend requires `duration` field on submit | Form submission returns 400, user sees no error message |

---

## CI pipeline comparison

| Metric | E2E (`e2e.yml`) | Contract (`contract-*.yml`) |
|--------|-----------------|-----------------------------|
| Avg duration | ~8-12 min | ~1-2 min |
| Requires full stack | Yes | No |
| Failure localisation | "Something in the app broke" | "Field X has wrong type on endpoint Y" |
| Catches `break-votes-shape` | Yes (vote count shows wrong) | Yes (type assertion fails immediately) |
| Catches `break-status-enum` | Yes (filter returns empty) | Yes (enum validation fails) |
| Catches `break-required-field` | Yes (form submit fails) | Yes (schema mismatch on POST /api/talks) |

---

## Deploy

### Frontend → GitHub Pages

1. Go to **Settings → Pages → Source: GitHub Actions**
2. Push to `main` — `deploy-frontend.yml` builds and deploys automatically
3. Set repo variable `VITE_API_URL` to the Render backend URL

### Backend → Render.com

1. Create a **Web Service**, connect this repo
2. Root directory: `src/backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set env var `FRONTEND_ORIGIN` to the GitHub Pages URL

### GitHub repo variables required

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Render backend URL (used by frontend build) |
| `PLAYWRIGHT_FRONTEND_URL` | GitHub Pages URL — `https://<user>.github.io/talkvote/` |
| `PLAYWRIGHT_BACKEND_URL` | Render backend URL (used by E2E tests) |

---

## Step-by-step progress

- [x] Step 0: Repository initialised
- [x] Step 1: Backend (Express + TypeScript + in-memory store + unit tests)
- [x] Step 2: Frontend (React + TypeScript + Vite)
- [ ] Step 3: Deploy (GitHub Pages + Render)
- [x] Step 4: E2E tests (Playwright, 8 scenarios)
- [ ] Step 5: Breaking change branches (3 prepared)
- [x] Step 6: Contract tests (schemathesis + Prism)
