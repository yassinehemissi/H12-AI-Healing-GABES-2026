from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# These schemas mirror the reusable ecocraft contracts inside the unified gabes_eco API.
class Difficulty(str, Enum):
    easy = "facile"
    medium = "moyen"
    hard = "difficile"


class MaterialsInput(BaseModel):
    materials: str = Field(..., min_length=10, max_length=500)
    preferences: Optional[str] = Field(default=None, max_length=200)
    language: str = Field(default="fr", pattern="^(fr|en|ar)$")


class Idea(BaseModel):
    id: str
    title: str
    description: str
    difficulty: Difficulty
    materials_used: List[str]
    estimated_time: str
    category: str


class IdeasResponse(BaseModel):
    session_id: str
    ideas: List[Idea]


class ImageGenerationInput(BaseModel):
    session_id: str
    chosen_idea: Idea
    style_preference: str = Field(default="realiste", max_length=120)


class ImageVariant(BaseModel):
    id: str
    url: str
    variant_name: str
    prompt_used: str


class ImagesResponse(BaseModel):
    session_id: str
    images: List[ImageVariant]
