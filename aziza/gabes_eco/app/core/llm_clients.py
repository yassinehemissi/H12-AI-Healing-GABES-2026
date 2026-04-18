from langchain_openai import ChatOpenAI
from app.core.config import settings

def get_text_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.MISTRAL_MODEL,
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://gabes-eco.local",
            "X-Title": "GabesEco Platform"
        }
    )

def get_vision_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model=settings.VLM_MODEL,
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://gabes-eco.local",
            "X-Title": "GabesEco Platform"
        }
    )
