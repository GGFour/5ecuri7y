from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "n8n-trigger-api"
    environment: str = "local"
    debug: bool = True

    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/postgres"

    n8n_webhook_url: str = "https://example.com/webhook/mock"
    n8n_timeout_seconds: int = 15

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
