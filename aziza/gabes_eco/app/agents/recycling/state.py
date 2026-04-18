from typing import TypedDict, List, Dict, Any, Optional

class RecyclingState(TypedDict):
    input_type: str              # "text" | "image"
    user_description: str        # Description textuelle du déchet
    image_base64: Optional[str]  # Image encodée base64 (optionnel)
    image_media_type: Optional[str] # "image/jpeg" | "image/png" etc.
    waste_category: str          # "plastique" | "verre" | "métal" | "papier" | "organique" | "électronique" | "dangereux" | "mixte"
    waste_details: str           # Description détaillée du déchet identifié
    recycling_instructions: List[str]
    disposal_method: str         # "bac recyclage" | "compost" | "déchetterie" | "collecte spéciale"
    environmental_impact: str    # Pourquoi c'est important de recycler ça
    sustainable_alternatives: List[str]
    eco_tip: str                 # Conseil écolo du jour
    final_response: Dict[str, Any]
