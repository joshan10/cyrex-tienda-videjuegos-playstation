from pydantic_settings import BaseSettings, SettingsConfigDict


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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
