.PHONY: dev backend-dev format test deploy frontend-test backend-test style-check checks pre-commit

COMPOSE=docker-compose -f docker-compose-app.yml
UV=UV_PROJECT_ENVIRONMENT=.venv uv

DEV_ENV=.env

dev:
	$(COMPOSE) up --build

backend-dev:
	cd backend && $(UV) run uvicorn app.main:app --reload --port 8000

backend-test:
	cd backend && $(UV) sync --all-extras --dev && $(UV) run pytest

frontend-test:
	cd frontend && npm ci --prefer-offline --no-audit --no-fund && npm run lint

style-check:
	cd backend && $(UV) sync --all-extras --dev && $(UV) run black --check app tests

format:
	cd backend && $(UV) run black app

test: backend-test frontend-test

checks: style-check backend-test frontend-test

pre-commit:
	pre-commit run --all-files

deploy:
	gcloud builds submit --config=infra/cloudrun/cloudbuild.yaml || echo "See README for manual deploy steps"
