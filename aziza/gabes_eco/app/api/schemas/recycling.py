from pydantic import BaseModel
from typing import List

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

class Category(BaseModel):
    id: str
    label: str
    emoji: str
    bin_color: str

class CategoriesResponse(BaseModel):
    categories: List[Category]
