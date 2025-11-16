# Full-stack n8n trigger platform

This repository contains a batteries-included monorepo that connects a FastAPI backend, a React + Vite + shadcn UI frontend, and a Postgres database. The backend uses **uv** for dependency management and is ready for Docker-based local development as well as Google Cloud Run and Cloud SQL deployments.

## Architecture overview

```
                        ┌─────────────────────────┐
                        │        Frontend         │
                        │ React + Vite + shadcn   │
                        │ Container (Nginx)       │
                        └──────────┬──────────────┘
                                   │ REST /api
                                   ▼
┌───────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│   Developer   │◀────▶│ FastAPI backend (uv)    │◀────▶│   Postgres database  │
│ docker-compose│      │ /api/trigger-n8n        │      │  (Cloud SQL ready)   │
└───────────────┘      │ Alembic migrations      │      └──────────────────────┘
                        │ Async n8n webhook call │
                        └──────────┬──────────────┘
                                   │ https
                                   ▼
                          ┌────────────────┐
                          │ n8n Webhook    │
                          │ (external)     │
                          └────────────────┘
```

## Repository layout

```
backend/    FastAPI app managed by uv, includes Alembic + tests
frontend/   React + Vite + shadcn UI, Vitest + RTL
infra/      Dockerfiles, Cloud Run templates, Terraform starter
.github/    GitHub Actions workflow for CI/CD
```

## Prerequisites

- Docker + Docker Compose
- (Optional) Google Cloud CLI for deployment
- For manual testing outside containers: Python 3.11, Node 20, uv, npm

## Local development

1. Copy `.env.example` to `.env` (optional – Compose already reads the example file).
2. Start everything with a single command:

   ```bash
   ./docker-compose-app
   # equivalent to: docker-compose -f docker-compose-app.yml up --build
   # or: make dev
   ```

3. Access the services:
   - Frontend (Nginx serving built assets): http://localhost:5173
   - Backend (FastAPI + docs): http://localhost:8000/docs
   - Postgres: localhost:5432 (user/password from `.env.example`)

The backend container installs dependencies with `uv`, runs Alembic migrations on boot, and starts Uvicorn. The frontend container builds the production bundle and serves it through Nginx for local parity with Cloud Run.

## Triggering the n8n pipeline

1. Open the frontend UI and enter a search term.
2. The frontend calls `POST /api/trigger-n8n` on the backend.
3. The backend asynchronously invokes the configured n8n webhook (`N8N_WEBHOOK_URL`), waits for the response (or falls back to a mocked payload in development), persists the result to Postgres, and returns JSON for display in the UI.
4. Results are rendered in the "Workflow response" panel.

You can also test the API directly:

```bash
curl -X POST http://localhost:8000/api/trigger-n8n \
  -H "Content-Type: application/json" \
  -d '{"query": "security"}'
```

## Fast checks (style + tests)

All of the quality gates run outside Docker so contributors can validate changes in seconds. Python tooling is isolated in `backend/.venv` and is always executed through [uv](https://github.com/astral-sh/uv) for reproducible dependency management.

```bash
make style-check          # Black --check for backend/app + backend/tests
make backend-test         # pytest via uv and backend/.venv
make frontend-test        # ESLint via npm (linting doubles as the fast frontend test)
make checks               # runs all of the above sequentially
```

Useful helpers:

```bash
make pre-commit           # run every pre-commit hook against the repo
pre-commit install        # install the hooks in .git/hooks
```

Vitest is available for deeper UI testing, but ESLint runs by default for a faster, deterministic signal. Backend pytest suites continue to cover the API routing and the n8n trigger behavior with monkeypatched webhook calls.

## Formatting

Backend formatting is powered by Black via uv and the shared `.venv`:

```bash
make format
```

(Feel free to add ESLint/Prettier formatters in the frontend if desired.)

## Docker images

- `infra/backend.Dockerfile`: installs uv, syncs dependencies, runs Alembic migrations, and launches Uvicorn.
- `infra/frontend.Dockerfile`: builds the Vite app and packages it behind Nginx for static hosting.

`docker-compose-app.yml` wires up the backend, frontend, and Postgres (with a persistent volume) so the entire stack runs from a single command.

## Google Cloud deployment

### Required resources

- Artifact Registry repository (e.g., `us-central1-docker.pkg.dev/PROJECT/n8n`)
- Cloud SQL Postgres instance
- Two Cloud Run services (backend + frontend)
- Optional Cloud Run Job for Alembic migrations

### Deployment flow

1. Provision infrastructure (manually or via Terraform in `infra/terraform`). Update variable defaults as needed.
2. Authenticate with `gcloud auth login` and configure Docker auth: `gcloud auth configure-docker REGION-docker.pkg.dev`.
3. Build and push images:

   ```bash
   docker build -t REGION-docker.pkg.dev/PROJECT/n8n/backend:TAG -f infra/backend.Dockerfile .
   docker push REGION-docker.pkg.dev/PROJECT/n8n/backend:TAG

   docker build -t REGION-docker.pkg.dev/PROJECT/n8n/frontend:TAG -f infra/frontend.Dockerfile .
   docker push REGION-docker.pkg.dev/PROJECT/n8n/frontend:TAG
   ```

4. Deploy Cloud Run services with the templates in `infra/cloudrun/*.yaml` or via CLI:

   ```bash
   gcloud run deploy n8n-backend \
     --image REGION-docker.pkg.dev/PROJECT/n8n/backend:TAG \
     --region REGION \
     --allow-unauthenticated \
     --set-env-vars "DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@/postgres?host=/cloudsql/INSTANCE,N8N_WEBHOOK_URL=..." \
     --add-cloudsql-instances INSTANCE

   gcloud run deploy n8n-frontend \
     --image REGION-docker.pkg.dev/PROJECT/n8n/frontend:TAG \
     --region REGION \
     --allow-unauthenticated \
     --set-env-vars "VITE_API_BASE_URL=https://BACKEND-URL"
   ```

5. Run Alembic migrations using a Cloud Run Job or Cloud Build step: `uv run alembic upgrade head` with the production DATABASE_URL.

GitHub Actions keeps the repo green:

- `.github/workflows/ci.yml` runs the same Black, pytest, and ESLint checks defined in the Makefile on every push/PR.
- `.github/workflows/deploy.yml` automates tests, builds/pushes both images, and deploys them to Cloud Run once proper GCP secrets are configured.

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy URL used by the backend/Alembic. | `postgresql+psycopg2://postgres:postgres@db:5432/postgres` |
| `N8N_WEBHOOK_URL` | External webhook invoked by `/api/trigger-n8n`. | `https://example.com/webhook/mock` |
| `N8N_TIMEOUT_SECONDS` | Timeout for the webhook request. | `15` |
| `VITE_API_BASE_URL` | Backend URL consumed by the frontend. | `http://backend:8000` inside Docker |
| `POSTGRES_*` | Standard Postgres credentials for docker-compose. | see `.env.example` |

> **Note:** `VITE_API_BASE_URL` is evaluated during the Vite build. Docker and Cloud Run builds inject the value through the `VITE_API_BASE_URL` build-arg defined in `infra/frontend.Dockerfile`.

## Infra extras

- `infra/terraform`: basic Terraform starter for Cloud SQL + Cloud Run.
- `infra/cloudrun/backend.yaml` & `frontend.yaml`: declarative deployment templates.
- `infra/cloudrun/README.md`: highlights manual deployment steps.

## FAQ

**How do I point to a real n8n workflow?**
Set `N8N_WEBHOOK_URL` in your `.env` file (or Docker/Cloud Run env vars) to the HTTPS endpoint exported from your n8n instance. The backend will relay payloads to that URL and return the upstream response.

**How do migrations run locally?**
The backend container executes `uv run alembic upgrade head` on every start via `backend/docker-entrypoint.sh`, guaranteeing that the schema matches the latest models.

**Can I develop the frontend separately?**
Yes. Run `npm install` followed by `npm run dev` in `frontend/` and point `VITE_API_BASE_URL` to your backend (e.g., `http://localhost:8000`).

Enjoy automating! 🚀
