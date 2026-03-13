from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/student_housing_dss"
    DATABASE_URL_SYNC: str = ""
    SECRET_KEY: str = "change-this-secret-key-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    APP_NAME: str = "Student Housing DSS"
    DEBUG: bool = False

    model_config = {"env_file": ".env", "extra": "ignore"}

    @model_validator(mode="after")
    def build_db_urls(self) -> "Settings":
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://"):
            self.DATABASE_URL = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            if not self.DATABASE_URL_SYNC:
                self.DATABASE_URL_SYNC = url.replace("postgresql://", "postgresql+psycopg://", 1)
        elif not self.DATABASE_URL_SYNC:
            self.DATABASE_URL_SYNC = url.replace("+asyncpg", "+psycopg")
        return self


@lru_cache()
def get_settings() -> Settings:
    return Settings()
