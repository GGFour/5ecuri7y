FROM python:3.11-slim AS base

ENV UV_LINK_MODE=copy
RUN apt-get update && apt-get install -y --no-install-recommends curl build-essential && rm -rf /var/lib/apt/lists/*
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen
COPY backend ./backend
WORKDIR /app/backend
COPY backend/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PYTHONPATH=/app/backend/app
ENV PORT=8000
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
