from typing import Any, Dict, List, Optional, TypedDict


# The recycling state now carries structured reuse signals so the same graph can trigger upcycling.
class RecyclingState(TypedDict):
    input_type: str
    user_description: str
    image_base64: Optional[str]
    image_media_type: Optional[str]
    waste_category: str
    waste_details: str
    recycling_instructions: List[str]
    disposal_method: str
    environmental_impact: str
    sustainable_alternatives: List[str]
    eco_tip: str
    detected_materials: List[str]
    reusable_parts: List[str]
    object_condition: str
    is_reusable: bool
    safety_flags: List[str]
    upcycling_eligible: bool
    upcycling_block_reason: Optional[str]
    upcycling_materials: Optional[str]
    upcycling_session_id: Optional[str]
    upcycling_ideas: List[Dict[str, Any]]
    final_response: Dict[str, Any]
