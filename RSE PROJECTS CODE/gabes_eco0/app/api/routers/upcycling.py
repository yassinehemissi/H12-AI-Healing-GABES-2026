import logging

import openai
from fastapi import APIRouter, HTTPException

from app.api.schemas.upcycling import ImageGenerationInput, ImagesResponse, IdeasResponse, MaterialsInput
from app.services.upcycling_service import generate_images, suggest_upcycling_ideas

router = APIRouter()
logger = logging.getLogger(__name__)


# This router keeps the useful ecocraft endpoints available inside gabes_eco's single FastAPI app.
@router.post("/suggest-ideas", response_model=IdeasResponse)
async def suggest_ideas(payload: MaterialsInput):
    try:
        result = await suggest_upcycling_ideas(
            detected_materials=[payload.materials],
            reusable_parts=[],
            waste_details=payload.materials,
            preferences=payload.preferences,
            language=payload.language,
        )
        return IdeasResponse(
            session_id=result["upcycling_session_id"],
            ideas=result["upcycling_ideas"],
        )
    except openai.RateLimitError:
        logger.warning("OpenAI rate limit reached during idea generation.")
        raise HTTPException(status_code=429, detail="OpenAI rate limit reached. Try again in a moment.")
    except ValueError as exc:
        logger.error("Failed to parse ideation response: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to parse AI response.") from exc
    except Exception as exc:
        logger.error("Unexpected error in suggest_ideas: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/generate-images", response_model=ImagesResponse)
async def create_images(payload: ImageGenerationInput):
    try:
        images = await generate_images(
            payload.session_id,
            payload.chosen_idea,
            payload.style_preference,
        )
        return ImagesResponse(session_id=payload.session_id, images=images)
    except openai.RateLimitError:
        logger.warning("OpenAI rate limit reached during image generation.")
        raise HTTPException(status_code=429, detail="OpenAI rate limit reached. Try again in a moment.")
    except openai.APIError as exc:
        logger.error("OpenAI API error during image generation: %s", exc)
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable.") from exc
    except Exception as exc:
        logger.error("Unexpected error in generate_images: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
