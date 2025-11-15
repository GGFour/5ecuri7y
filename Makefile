.PHONY: dev backend-dev format test deploy frontend-test backend-test

COMPOSE=docker-compose -f docker-compose-app.yml

DEV_ENV=.env

dev:
	$(COMPOSE) up --build

backend-dev:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

backend-test:
	cd backend && uv sync --all-extras && uv run pytest

frontend-test:
	cd frontend && npm install && npm run test -- --run

format:
	cd backend && uv run black app

test: backend-test frontend-test

deploy:
	gcloud builds submit --config=infra/cloudrun/cloudbuild.yaml || echo "See README for manual deploy steps"
