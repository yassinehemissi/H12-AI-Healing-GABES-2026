from typing import List, Optional

from pydantic import BaseModel, Field

from app.api.schemas.upcycling import Idea


class RecyclingTextRequest(BaseModel):
    description: str


class RecyclingResponse(BaseModel):
    waste_category: str
    waste_details: str
    recycling_instructions: List[str]
    disposal_method: str
    environmental_impact: str
    sustainable_alternatives: List[str]
    eco_tip: str


# The image response is enriched so the recycling flow can directly feed the integrated upcycling pipeline.
class RecyclingImageResponse(RecyclingResponse):
    detected_materials: List[str] = Field(default_factory=list)
    reusable_parts: List[str] = Field(default_factory=list)
    object_condition: str = "endommage"
    is_reusable: bool = False
    safety_flags: List[str] = Field(default_factory=list)
    upcycling_eligible: bool = False
    upcycling_block_reason: Optional[str] = None
    upcycling_materials: Optional[str] = None
    upcycling_session_id: Optional[str] = None
    upcycling_ideas: List[Idea] = Field(default_factory=list)


class Category(BaseModel):
    id: str
    label: str
    emoji: str
    bin_color: str


class CategoriesResponse(BaseModel):
    categories: List[Category]
