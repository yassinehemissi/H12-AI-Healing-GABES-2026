from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.agents.orchestrator.router import route_query
from app.agents.transparency.graph import run_transparency_agent
from app.agents.recycling.graph import run_recycling_agent
from app.utils.image_utils import encode_image_to_base64
import json

router = APIRouter()

@router.post("/chat")
async def orchestrator_chat(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Unified endpoint:
    - If image is present -> routed to Recycling
    - If text only -> routed by LLM to Transparency or Recycling
    """
    if file is not None:
        try:
            b64 = await encode_image_to_base64(file)
            inputs = {
                "input_type": "image",
                "user_description": text or "",
                "image_base64": b64,
                "image_media_type": file.content_type
            }
            result = await run_recycling_agent(inputs)
            return {"agent": "recycling", "response": result.get("final_response")}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    if not text:
        raise HTTPException(status_code=400, detail="Veuillez fournir du texte ou une image.")
        
    try:
        decision = await route_query(text)
        
        if decision.destination == "transparency":
            loc = decision.extracted_location or "Centre_Ville"
            # Normalize location spaces to underscores to match database
            loc = loc.replace(" ", "_")
            
            inputs = {
                "location": loc,
                "date": None,
                "user_profile": {"age_group": "adulte", "vulnerabilities": []}, # Generic profile
                "user_query": text # Pass user query to be used as a real-time report
            }
            result = await run_transparency_agent(inputs)
            return {"agent": "transparency", "response": result.get("final_response")}
            
        else:
            inputs = {
                "input_type": "text",
                "user_description": text,
                "image_base64": None,
                "image_media_type": None
            }
            result = await run_recycling_agent(inputs)
            return {"agent": "recycling", "response": result.get("final_response")}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
