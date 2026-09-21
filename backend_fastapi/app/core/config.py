from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    port: int = 4000
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "developer"
    db_password: str = ""
    db_name: str = "cyrex_db"
    db_use_ssl: str = "false"

    jwt_secret: str
    jwt_expires_in: str = "24h"
    cors_origin: str = "http://localhost:5173"
    cors_origins: str = ""
    frontend_url: str = "http://localhost:5173"

    # Stripe Configuration
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_currency_default: str = "usd"

    # Chatbot configuration. The key is read only from the environment.
    ai_api_key: str = ""
    ai_model: str = "gemini-3.6-flash"
    ai_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
