from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "n8n-trigger-api"
    environment: str = "local"
    debug: bool = True

    database_url: str = (
        "postgresql+psycopg2://withsecure:security@31.22.104.110:5432/withsecure"
    )

    n8n_webhook_url: str = "https://example.com/webhook/mock"
    n8n_timeout_seconds: int = 15
    n8n_jwt_token: str = "json.web.token"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()
