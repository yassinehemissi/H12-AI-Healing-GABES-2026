import asyncio
import json
import logging
import os
import uuid
from typing import Any, Dict, List, Optional

import aiofiles
import httpx
import openai

from app.api.schemas.upcycling import Idea
from app.core.config import settings
from app.core.llm_clients import get_text_llm

logger = logging.getLogger(__name__)


# These helpers are reused from ecocraft so gabes_eco can serve one integrated ideation pipeline.
def build_ideas_prompt(materials: str, preferences: Optional[str], language: str) -> tuple[str, str]:
    system = """You are an expert upcycling craftsperson and creative designer specializing in
transforming waste materials into beautiful, functional objects. You have deep knowledge of:
- DIY techniques for plastic, glass, wood, metal, cardboard
- Safety considerations for each material type
- Realistic time and skill estimations
- Aesthetic design principles

Always respond in valid JSON format with exactly 5 creative ideas.
Each idea must be realistic and achievable by an amateur."""

    user = f"""Materials available: {materials}

User preferences: {preferences or 'No specific preferences'}
Response language: {language}

Generate exactly 5 creative upcycling ideas as JSON:
{{
  "ideas": [
    {{
      "id": "idea_1",
      "title": "...",
      "description": "2-3 sentences describing the object and its use",
      "difficulty": "facile|moyen|difficile",
      "materials_used": ["material1", "material2"],
      "estimated_time": "X heures",
      "category": "decoration|rangement|jardinage|luminaire|mobilier|jeux|cuisine"
    }}
  ]
}}"""
    return system, user


def build_dalle_prompt(
    idea_title: str,
    idea_description: str,
    materials: List[str],
    variant: int,
    style_preference: str,
) -> str:
    variants_config = {
        1: "front view, clean white background, professional product photography style",
        2: "three-quarter perspective view, soft natural lighting, studio photography",
        3: "exploded view diagram showing components, technical illustration style, clean lines",
    }

    return f"""Handcrafted recycled object: {idea_title}.
{idea_description}
Made from: {', '.join(materials)}.
Preferred visual style: {style_preference}.
Style: {variants_config[variant]}.
High quality render, detailed craftsmanship visible, eco-friendly aesthetic.
No text, no labels, no watermarks."""


def format_materials_for_ideas(
    detected_materials: List[str],
    reusable_parts: List[str],
    waste_details: str,
) -> str:
    cleaned_detected = [item.strip() for item in detected_materials if item and item.strip()]
    cleaned_parts = [item.strip() for item in reusable_parts if item and item.strip()]

    segments: List[str] = []
    if cleaned_detected:
        segments.append("materiaux detectes: " + ", ".join(dict.fromkeys(cleaned_detected)))
    if cleaned_parts:
        segments.append("parties reutilisables: " + ", ".join(dict.fromkeys(cleaned_parts)))
    if waste_details.strip():
        segments.append("objet source: " + waste_details.strip())

    return "; ".join(segments)[:500]


def _strip_json_fence(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


async def generate_ideas(materials: str, preferences: Optional[str], language: str) -> List[Dict[str, Any]]:
    system_prompt, user_prompt = build_ideas_prompt(materials, preferences, language)

    if settings.OPENAI_API_KEY:
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        for attempt in range(2):
            try:
                response = await client.chat.completions.create(
                    model=settings.OPENAI_TEXT_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.8,
                    max_tokens=2000,
                )
                content = response.choices[0].message.content or "{}"
                data = json.loads(content)
                return data.get("ideas", [])
            except (json.JSONDecodeError, KeyError) as exc:
                logger.warning("Failed to parse OpenAI ideas response on attempt %s: %s", attempt + 1, exc)
                if attempt == 1:
                    raise ValueError(f"OpenAI response parsing failed after 2 attempts: {exc}") from exc
                user_prompt += "\n\nIMPORTANT: Respond with ONLY valid JSON containing an 'ideas' list, no markdown."

    # Fallback to the existing OpenRouter-backed text LLM so ideation still works with gabes_eco config.
    llm = get_text_llm()
    response = await llm.ainvoke(
        [
            ("system", system_prompt),
            ("human", user_prompt + "\n\nRespond with valid JSON only."),
        ]
    )
    content = response.content if isinstance(response.content, str) else json.dumps(response.content)
    data = json.loads(_strip_json_fence(content))
    return data.get("ideas", [])


async def suggest_upcycling_ideas(
    detected_materials: List[str],
    reusable_parts: List[str],
    waste_details: str,
    preferences: Optional[str] = None,
    language: str = "fr",
) -> Dict[str, Any]:
    materials = format_materials_for_ideas(detected_materials, reusable_parts, waste_details)
    ideas = await generate_ideas(materials, preferences, language)
    return {
        "upcycling_session_id": str(uuid.uuid4()),
        "upcycling_materials": materials,
        "upcycling_ideas": ideas,
    }


async def download_image(url: str, output_path: str) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        async with aiofiles.open(output_path, "wb") as file_handle:
            await file_handle.write(response.content)


async def generate_single_variant(
    client: openai.AsyncOpenAI,
    idea: Idea,
    variant: int,
    session_id: str,
    style_preference: str,
) -> Dict[str, Any]:
    prompt = build_dalle_prompt(
        idea.title,
        idea.description,
        idea.materials_used,
        variant,
        style_preference,
    )
    variant_names = {
        1: "Vue de face",
        2: "Vue en perspective",
        3: "Vue eclatee",
    }

    response = await client.images.generate(
        model=settings.OPENAI_IMAGE_MODEL,
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )
    url = response.data[0].url
    if not url:
        raise RuntimeError("The image provider did not return a downloadable URL.")

    local_filename = f"variant_{variant}.png"
    local_dir = os.path.join("app", "static", "upcycling_images", session_id)
    local_path = os.path.join(local_dir, local_filename)
    await download_image(url, local_path)

    return {
        "id": f"img_{variant}_{uuid.uuid4().hex[:8]}",
        "url": f"/static/upcycling_images/{session_id}/{local_filename}",
        "variant_name": variant_names.get(variant, f"Variant {variant}"),
        "prompt_used": prompt,
    }


async def generate_images(session_id: str, chosen_idea: Idea, style_preference: str) -> List[Dict[str, Any]]:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is required to generate product images.")

    client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    tasks = [
        generate_single_variant(client, chosen_idea, 1, session_id, style_preference),
        generate_single_variant(client, chosen_idea, 2, session_id, style_preference),
        generate_single_variant(client, chosen_idea, 3, session_id, style_preference),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful_images: List[Dict[str, Any]] = []
    for result in results:
        if isinstance(result, Exception):
            logger.error("One image generation task failed: %s", result)
        else:
            successful_images.append(result)

    if not successful_images:
        raise RuntimeError("All image generations failed.")

    return successful_images
