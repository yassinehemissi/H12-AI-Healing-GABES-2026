import json

from langchain_core.messages import HumanMessage

from app.agents.recycling.prompts import (
    EXTRACT_REUSABLE_MATERIALS_PROMPT,
    GENERATE_ECO_ADVICE_PROMPT,
    GENERATE_GUIDANCE_PROMPT,
    IDENTIFY_WASTE_TEXT_PROMPT,
)
from app.agents.recycling.state import RecyclingState
from app.agents.recycling.tools import search_recycling_info
from app.core.llm_clients import get_text_llm, get_vision_llm
from app.services.upcycling_service import suggest_upcycling_ideas


def input_classifier_node(state: RecyclingState) -> str:
    return state.get("input_type", "text")


async def identify_waste_text_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = IDENTIFY_WASTE_TEXT_PROMPT | llm

    description = state.get("user_description", "")
    search_context = search_recycling_info(f"Comment recycler {description} consignes de tri tunisie")
    response = await chain.ainvoke(
        {
            "description": description,
            "search_context": search_context,
        }
    )

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "waste_category": parsed.get("waste_category", "mixte"),
            "waste_details": parsed.get("waste_details", "Dechet non identifie"),
        }
    except Exception:
        return {
            "waste_category": "mixte",
            "waste_details": "Erreur d'identification",
        }


async def identify_waste_vision_node(state: RecyclingState) -> dict:
    llm = get_vision_llm()

    b64 = state.get("image_base64")
    media_type = state.get("image_media_type", "image/jpeg")

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": """Tu es un expert en recyclage. Identifie le dechet sur l'image.
Reponds uniquement en JSON structure avec :
- "waste_category": une des categories ("plastique", "verre", "metal", "papier", "organique", "electronique", "dangereux", "mixte")
- "waste_details": une courte description technique.""",
            },
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
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
            "waste_details": parsed.get("waste_details", "Image non reconnue"),
        }
    except Exception:
        return {
            "waste_category": "mixte",
            "waste_details": "Erreur d'analyse d'image",
        }


# This second vision pass extracts reusable materials without asking the user to upload the image again.
async def extract_reusable_materials_node(state: RecyclingState) -> dict:
    llm = get_vision_llm()

    b64 = state.get("image_base64")
    media_type = state.get("image_media_type", "image/jpeg")

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": EXTRACT_REUSABLE_MATERIALS_PROMPT.format(
                    waste_category=state.get("waste_category", "mixte"),
                    waste_details=state.get("waste_details", ""),
                ),
            },
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}},
        ]
    )

    try:
        response = await llm.ainvoke([message])
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)

        condition = str(parsed.get("object_condition", "endommage")).strip().lower()
        if condition not in {"bon", "use", "endommage"}:
            condition = "endommage"

        safety_flags = parsed.get("safety_flags", [])
        if not isinstance(safety_flags, list):
            safety_flags = [str(safety_flags)]

        return {
            "detected_materials": [str(item) for item in parsed.get("detected_materials", []) if str(item).strip()],
            "reusable_parts": [str(item) for item in parsed.get("reusable_parts", []) if str(item).strip()],
            "object_condition": condition,
            "is_reusable": bool(parsed.get("is_reusable", False)),
            "safety_flags": [str(item) for item in safety_flags if str(item).strip()],
        }
    except Exception:
        return {
            "detected_materials": [],
            "reusable_parts": [],
            "object_condition": "endommage",
            "is_reusable": False,
            "safety_flags": ["analyse_materiaux_indisponible"],
        }


async def generate_recycling_guidance_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_GUIDANCE_PROMPT | llm

    response = await chain.ainvoke(
        {
            "waste_category": state.get("waste_category"),
            "waste_details": state.get("waste_details"),
        }
    )

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "recycling_instructions": parsed.get("recycling_instructions", []),
            "disposal_method": parsed.get("disposal_method", "Poubelle ordinaire"),
            "environmental_impact": parsed.get("environmental_impact", ""),
        }
    except Exception:
        return {
            "recycling_instructions": ["Jetez dans la poubelle appropriee."],
            "disposal_method": "Inconnu",
            "environmental_impact": "",
        }


async def generate_eco_advice_node(state: RecyclingState) -> dict:
    llm = get_text_llm()
    chain = GENERATE_ECO_ADVICE_PROMPT | llm

    response = await chain.ainvoke(
        {
            "waste_category": state.get("waste_category"),
            "waste_details": state.get("waste_details"),
        }
    )

    try:
        content = response.content
        if content.startswith("```json"):
            content = content[7:-3]
        parsed = json.loads(content)
        return {
            "sustainable_alternatives": parsed.get("sustainable_alternatives", []),
            "eco_tip": parsed.get("eco_tip", "Pensez a reduire vos dechets."),
        }
    except Exception:
        return {
            "sustainable_alternatives": [],
            "eco_tip": "Pensez a reduire, reutiliser et recycler.",
        }


# This node triggers ecocraft ideation only when the reuse guard says the object is safe and reusable.
async def generate_upcycling_ideas_node(state: RecyclingState) -> dict:
    safety_flags = [str(flag) for flag in state.get("safety_flags", []) if str(flag).strip()]
    is_reusable = bool(state.get("is_reusable", False))

    if not is_reusable:
        return {
            "upcycling_eligible": False,
            "upcycling_block_reason": "Objet non reutilisable pour un projet d'upcycling.",
            "upcycling_materials": None,
            "upcycling_session_id": None,
            "upcycling_ideas": [],
        }

    if safety_flags:
        return {
            "upcycling_eligible": False,
            "upcycling_block_reason": "Objet bloque pour l'upcycling a cause des risques detectes.",
            "upcycling_materials": None,
            "upcycling_session_id": None,
            "upcycling_ideas": [],
        }

    try:
        result = await suggest_upcycling_ideas(
            detected_materials=state.get("detected_materials", []),
            reusable_parts=state.get("reusable_parts", []),
            waste_details=state.get("waste_details", ""),
        )
        return {
            "upcycling_eligible": True,
            "upcycling_block_reason": None,
            "upcycling_materials": result["upcycling_materials"],
            "upcycling_session_id": result["upcycling_session_id"],
            "upcycling_ideas": result["upcycling_ideas"],
        }
    except Exception as exc:
        return {
            "upcycling_eligible": False,
            "upcycling_block_reason": f"Ideation indisponible: {exc}",
            "upcycling_materials": None,
            "upcycling_session_id": None,
            "upcycling_ideas": [],
        }


async def format_final_response_node(state: RecyclingState) -> dict:
    env_impact = state.get("environmental_impact", "")
    if isinstance(env_impact, dict):
        env_impact = " ".join(str(value) for value in env_impact.values())
    elif not isinstance(env_impact, str):
        env_impact = str(env_impact)

    alternatives = state.get("sustainable_alternatives", [])
    if isinstance(alternatives, list):
        parsed_alternatives = []
        for alternative in alternatives:
            if isinstance(alternative, dict):
                parsed_alternatives.append(
                    alternative.get("description")
                    or alternative.get("name")
                    or " ".join(str(value) for value in alternative.values())
                )
            else:
                parsed_alternatives.append(str(alternative))
        alternatives = parsed_alternatives
    else:
        alternatives = [str(alternatives)]

    final = {
        "waste_category": str(state.get("waste_category", "mixte")),
        "waste_details": str(state.get("waste_details", "")),
        "recycling_instructions": [str(item) for item in state.get("recycling_instructions", [])],
        "disposal_method": str(state.get("disposal_method", "")),
        "environmental_impact": env_impact,
        "sustainable_alternatives": alternatives,
        "eco_tip": str(state.get("eco_tip", "")),
        "detected_materials": [str(item) for item in state.get("detected_materials", [])],
        "reusable_parts": [str(item) for item in state.get("reusable_parts", [])],
        "object_condition": str(state.get("object_condition", "endommage")),
        "is_reusable": bool(state.get("is_reusable", False)),
        "safety_flags": [str(item) for item in state.get("safety_flags", [])],
        "upcycling_eligible": bool(state.get("upcycling_eligible", False)),
        "upcycling_block_reason": state.get("upcycling_block_reason"),
        "upcycling_materials": state.get("upcycling_materials"),
        "upcycling_session_id": state.get("upcycling_session_id"),
        "upcycling_ideas": state.get("upcycling_ideas", []),
    }
    return {"final_response": final}
