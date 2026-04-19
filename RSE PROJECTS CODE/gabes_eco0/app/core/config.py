from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "GabesEco Platform"
    DEBUG: bool = True

    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    MISTRAL_API_KEY: Optional[str] = None

    MISTRAL_MODEL: str = "mistral/mistral-large-latest"
    VLM_MODEL: str = "openai/gpt-4o"
    OPENAI_TEXT_MODEL: str = "gpt-4o"
    OPENAI_IMAGE_MODEL: str = "dall-e-3"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    TAVILY_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # This keeps existing env values like "release" or "debug" from breaking startup.
    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        if isinstance(value, bool):
            return value
        if value is None:
            return True
        text = str(value).strip().lower()
        if text in {"1", "true", "yes", "on", "debug", "dev", "development"}:
            return True
        if text in {"0", "false", "no", "off", "release", "prod", "production"}:
            return False
        return True


settings = Settings()
