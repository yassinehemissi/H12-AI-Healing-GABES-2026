from fastapi import APIRouter, HTTPException, UploadFile, File
from app.api.schemas.recycling import RecyclingTextRequest, RecyclingResponse, CategoriesResponse, Category
from app.agents.recycling.graph import run_recycling_agent
from app.utils.image_utils import encode_image_to_base64

router = APIRouter()

@router.post("/identify-text", response_model=RecyclingResponse)
async def identify_text(request: RecyclingTextRequest):
    try:
        inputs = {
            "input_type": "text",
            "user_description": request.description,
            "image_base64": None,
            "image_media_type": None
        }
        result = await run_recycling_agent(inputs)
        return result["final_response"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/identify-image", response_model=RecyclingResponse)
async def identify_image(file: UploadFile = File(...)):
    try:
        b64 = await encode_image_to_base64(file)
        inputs = {
            "input_type": "image",
            "user_description": "",
            "image_base64": b64,
            "image_media_type": file.content_type
        }
        result = await run_recycling_agent(inputs)
        return result["final_response"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=CategoriesResponse)
async def get_categories():
    categories = [
        {"id": "plastique", "label": "Plastique", "emoji": "🧴", "bin_color": "jaune"},
        {"id": "verre", "label": "Verre", "emoji": "🍾", "bin_color": "vert"},
        {"id": "papier", "label": "Papier/Carton", "emoji": "📦", "bin_color": "bleu"},
        {"id": "metal", "label": "Métal", "emoji": "🥫", "bin_color": "jaune"},
        {"id": "organique", "label": "Déchets organiques", "emoji": "🍌", "bin_color": "marron"},
        {"id": "electronique", "label": "Électronique (DEEE)", "emoji": "📱", "bin_color": "collecte spéciale"},
        {"id": "dangereux", "label": "Déchets dangereux", "emoji": "⚗️", "bin_color": "déchetterie"},
        {"id": "mixte", "label": "Déchet mixte", "emoji": "🗑️", "bin_color": "gris/noir"}
    ]
    return CategoriesResponse(categories=categories)
