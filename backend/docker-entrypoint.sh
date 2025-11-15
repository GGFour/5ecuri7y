#!/usr/bin/env bash
set -euo pipefail

uv sync --frozen
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
