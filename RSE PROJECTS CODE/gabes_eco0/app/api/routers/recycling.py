from fastapi import APIRouter, File, HTTPException, UploadFile

from app.agents.recycling.graph import run_recycling_agent
from app.api.schemas.recycling import (
    CategoriesResponse,
    Category,
    RecyclingImageResponse,
    RecyclingResponse,
    RecyclingTextRequest,
)
from app.utils.image_utils import encode_image_to_base64

router = APIRouter()


@router.post("/identify-text", response_model=RecyclingResponse)
async def identify_text(request: RecyclingTextRequest):
    try:
        inputs = {
            "input_type": "text",
            "user_description": request.description,
            "image_base64": None,
            "image_media_type": None,
        }
        result = await run_recycling_agent(inputs)
        return result["final_response"]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# The image endpoint now returns both recycling guidance and upcycling ideas when the object is reusable.
@router.post("/identify-image", response_model=RecyclingImageResponse)
async def identify_image(file: UploadFile = File(...)):
    try:
        b64 = await encode_image_to_base64(file)
        inputs = {
            "input_type": "image",
            "user_description": "",
            "image_base64": b64,
            "image_media_type": file.content_type,
        }
        result = await run_recycling_agent(inputs)
        return result["final_response"]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/categories", response_model=CategoriesResponse)
async def get_categories():
    categories = [
        {"id": "plastique", "label": "Plastique", "emoji": "🧴", "bin_color": "jaune"},
        {"id": "verre", "label": "Verre", "emoji": "🍾", "bin_color": "vert"},
        {"id": "papier", "label": "Papier/Carton", "emoji": "📦", "bin_color": "bleu"},
        {"id": "metal", "label": "Metal", "emoji": "🥫", "bin_color": "jaune"},
        {"id": "organique", "label": "Dechets organiques", "emoji": "🍌", "bin_color": "marron"},
        {"id": "electronique", "label": "Electronique (DEEE)", "emoji": "📱", "bin_color": "collecte speciale"},
        {"id": "dangereux", "label": "Dechets dangereux", "emoji": "⚠️", "bin_color": "dechetterie"},
        {"id": "mixte", "label": "Dechet mixte", "emoji": "🗑️", "bin_color": "gris/noir"},
    ]
    return CategoriesResponse(categories=categories)
