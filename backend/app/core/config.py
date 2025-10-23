from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from functools import lru_cache

class Settings(BaseSettings):
    # API Settings
    api_v1_prefix: str = "/api/v1"
    project_name: str = "EduMind"
    version: str = "1.0.0"
    description: str = "AI-powered educational chatbot for personalized tutoring"

    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://edumind:edumind@localhost:5432/edumind")

    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # HuggingFace
    huggingface_api_key: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")
    model_name: str = "microsoft/DialoGPT-medium"

    # OpenAI (fallback)
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")

    # Speech Services
    speech_key: Optional[str] = os.getenv("SPEECH_KEY")
    speech_region: Optional[str] = os.getenv("SPEECH_REGION")

    # Translation
    translation_api_key: Optional[str] = os.getenv("TRANSLATION_API_KEY")

    # File Upload
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: List[str] = ["mp3", "wav", "ogg", "m4a"]

    # Supported Languages
    supported_languages: List[str] = ["en", "fr", "pidgin"]

    # Offline Mode
    enable_offline_mode: bool = True
    cache_ttl: int = 3600  # 1 hour

    # Analytics
    enable_analytics: bool = True
    analytics_retention_days: int = 365

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
