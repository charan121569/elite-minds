import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "dev_secret_key_change_in_production_elite_minds_2026_super_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # MySQL Database Config
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "ai_dev_agent"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DATABASE_URL: str | None = None

    # AI Configuration
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.0-flash"

    # Frontend CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @computed_field
    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # PyMySQL connection string
        pwd = f":{self.DB_PASSWORD}" if self.DB_PASSWORD else ""
        return f"mysql+pymysql://{self.DB_USER}{pwd}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY.strip()) > 5)

settings = Settings()
