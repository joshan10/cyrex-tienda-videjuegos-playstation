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
    jwt_secret: str
    jwt_expires_in: str = "24h"
    cors_origin: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"

    # Wompi Configuration
    wompi_mock_mode: bool = True
    wompi_public_key: str = "pub_test_mock"
    wompi_private_key: str = "prv_test_mock"
    wompi_integrity_secret: str = "mock_integrity_secret"
    wompi_events_secret: str = "mock_events_secret"
    wompi_base_url: str = "https://sandbox.wompi.co/v1"

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
