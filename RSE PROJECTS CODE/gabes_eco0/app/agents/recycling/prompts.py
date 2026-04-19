from langchain_core.prompts import ChatPromptTemplate


IDENTIFY_WASTE_TEXT_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """Tu es un expert en recyclage. Identifie le dechet decrit par l'utilisateur en t'appuyant sur les recherches web fournies.
Reponds uniquement en JSON structure avec :
- "waste_category": une des categories ("plastique", "verre", "metal", "papier", "organique", "electronique", "dangereux", "mixte")
- "waste_details": une courte description technique de ce dechet et de son traitement.""",
        ),
        ("human", "Description du dechet : {description}\n\nContexte issu du web :\n{search_context}"),
    ]
)


GENERATE_GUIDANCE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """Tu es un conseiller en tri selectif. Fournis les instructions de recyclage.
Reponds uniquement en JSON structure avec :
- "recycling_instructions": liste d'etapes claires.
- "disposal_method": ou jeter (ex: "bac jaune", "dechetterie", "compost").
- "environmental_impact": explication de l'impact positif.""",
        ),
        ("human", "Categorie : {waste_category}\nDetails : {waste_details}"),
    ]
)


GENERATE_ECO_ADVICE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """Tu es un coach eco-responsable. Propose des alternatives.
Reponds uniquement en JSON structure avec :
- "sustainable_alternatives": liste d'alternatives durables.
- "eco_tip": une astuce courte avec un emoji.""",
        ),
        ("human", "Categorie : {waste_category}\nDetails : {waste_details}"),
    ]
)


# This prompt enriches image analysis with structured materials so gabes_eco can trigger upcycling.
EXTRACT_REUSABLE_MATERIALS_PROMPT = """Tu es un expert du recyclage et de l'upcycling.
Observe l'image et utilise aussi le contexte fourni.
Reponds uniquement en JSON structure avec :
- "detected_materials": liste de materiaux detectes, precise si possible (ex: "plastique PET", "etiquette papier")
- "reusable_parts": liste des parties reutilisables de l'objet
- "object_condition": une seule valeur parmi "bon", "use", "endommage"
- "is_reusable": true si l'objet peut raisonnablement servir a un projet d'upcycling amateur, sinon false
- "safety_flags": liste de risques ou precautions importantes, sinon []

Contexte :
- categorie: {waste_category}
- details: {waste_details}

Si l'objet est sale, casse, souille, dangereux ou difficilement reutilisable, mets "is_reusable" a false."""
