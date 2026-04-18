import json
from langchain_core.messages import HumanMessage
from app.agents.recycling.state import RecyclingState
from app.agents.recycling.prompts import IDENTIFY_WASTE_TEXT_PROMPT, GENERATE_GUIDANCE_PROMPT, GENERATE_ECO_ADVICE_PROMPT
from app.core.llm_clients import get_text_llm, get_vision_llm
from app.agents.recycling.tools import search_recycling_info

def input_classifier_node(state: RecyclingState) -> str:
    # Ce noeud retourne juste le type pour le conditional edge
    return state.get("input_type", "text")

async def identify_waste_text_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = IDENTIFY_WASTE_TEXT_PROMPT | llm
    
    desc = state.get("user_description", "")
    # Recherche Tavily
    search_context = search_recycling_info(f"Comment recycler {desc} consignes de tri tunisie")
    
    response = await chain.ainvoke({
        "description": desc,
        "search_context": search_context
    })
    
    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "waste_category": parsed.get("waste_category", "mixte"),
            "waste_details": parsed.get("waste_details", "Déchet non identifié")
        }
    except Exception:
        return {"waste_category": "mixte", "waste_details": "Erreur d'identification"}

async def identify_waste_vision_node(state: RecyclingState) -> dict:
    llm = get_vision_llm()
    
    b64 = state.get("image_base64")
    media_type = state.get("image_media_type", "image/jpeg")
    
    message = HumanMessage(
        content=[
            {"type": "text", "text": """Tu es un expert en recyclage. Identifie le déchet sur l'image.
Réponds uniquement en JSON structuré avec :
- "waste_category": une des catégories ("plastique", "verre", "métal", "papier", "organique", "électronique", "dangereux", "mixte")
- "waste_details": une courte description technique."""},
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}}
        ]
    )
    
    response = await llm.ainvoke([message])
    
    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "waste_category": parsed.get("waste_category", "mixte"),
            "waste_details": parsed.get("waste_details", "Image non reconnue")
        }
    except Exception:
        return {"waste_category": "mixte", "waste_details": "Erreur d'analyse d'image"}

async def generate_recycling_guidance_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_GUIDANCE_PROMPT | llm
    
    response = await chain.ainvoke({
        "waste_category": state.get("waste_category"),
        "waste_details": state.get("waste_details")
    })
    
    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "recycling_instructions": parsed.get("recycling_instructions", []),
            "disposal_method": parsed.get("disposal_method", "Poubelle ordinaire"),
            "environmental_impact": parsed.get("environmental_impact", "")
        }
    except Exception:
        return {
            "recycling_instructions": ["Jetez dans la poubelle appropriée."],
            "disposal_method": "Inconnu",
            "environmental_impact": ""
        }

async def generate_eco_advice_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_ECO_ADVICE_PROMPT | llm
    
    response = await chain.ainvoke({
        "waste_category": state.get("waste_category"),
        "waste_details": state.get("waste_details")
    })
    
    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "sustainable_alternatives": parsed.get("sustainable_alternatives", []),
            "eco_tip": parsed.get("eco_tip", "Pensez à réduire vos déchets.")
        }
    except Exception:
        return {
            "sustainable_alternatives": [],
            "eco_tip": "💡 Réduisez, Réutilisez, Recyclez."
        }

async def format_final_response_node(state: RecyclingState) -> dict:
    env_impact = state.get("environmental_impact", "")
    if isinstance(env_impact, dict):
        env_impact = " ".join(str(v) for v in env_impact.values())
    elif not isinstance(env_impact, str):
        env_impact = str(env_impact)

    alts = state.get("sustainable_alternatives", [])
    if isinstance(alts, list):
        parsed_alts = []
        for alt in alts:
            if isinstance(alt, dict):
                # Try to extract the most meaningful field or just dump values
                parsed_alts.append(alt.get("description") or alt.get("name") or " ".join(str(v) for v in alt.values()))
            else:
                parsed_alts.append(str(alt))
        alts = parsed_alts
    else:
        alts = [str(alts)]

    final = {
        "waste_category": str(state.get("waste_category", "mixte")),
        "waste_details": str(state.get("waste_details", "")),
        "recycling_instructions": [str(i) for i in state.get("recycling_instructions", [])],
        "disposal_method": str(state.get("disposal_method", "")),
        "environmental_impact": env_impact,
        "sustainable_alternatives": alts,
        "eco_tip": str(state.get("eco_tip", ""))
    }
    return {"final_response": final}
