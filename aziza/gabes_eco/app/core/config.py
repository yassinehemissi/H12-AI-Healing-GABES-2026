from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "GabèsEco Platform"
    DEBUG: bool = True
    
    OPENROUTER_API_KEY: str = ""
    MISTRAL_API_KEY: Optional[str] = None
    
    MISTRAL_MODEL: str = "mistral/mistral-large-latest"
    VLM_MODEL: str = "openai/gpt-4o"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    TAVILY_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
