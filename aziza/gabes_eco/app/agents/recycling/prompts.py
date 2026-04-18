from langchain_core.prompts import ChatPromptTemplate

IDENTIFY_WASTE_TEXT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu es un expert en recyclage. Identifie le déchet décrit par l'utilisateur en t'appuyant sur les recherches web fournies.
Réponds uniquement en JSON structuré avec :
- "waste_category": une des catégories ("plastique", "verre", "métal", "papier", "organique", "électronique", "dangereux", "mixte")
- "waste_details": une courte description technique de ce déchet et de son traitement."""),
    ("human", "Description du déchet : {description}\n\nContexte issu du web :\n{search_context}")
])

GENERATE_GUIDANCE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu es un conseiller en tri sélectif. Fournis les instructions de recyclage.
Réponds uniquement en JSON structuré avec :
- "recycling_instructions": liste d'étapes claires.
- "disposal_method": où jeter (ex: "bac jaune", "déchetterie", "compost").
- "environmental_impact": explication de l'impact positif."""),
    ("human", "Catégorie : {waste_category}\nDétails : {waste_details}")
])

GENERATE_ECO_ADVICE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu es un coach éco-responsable. Propose des alternatives.
Réponds uniquement en JSON structuré avec :
- "sustainable_alternatives": liste d'alternatives durables.
- "eco_tip": une astuce courte avec un emoji."""),
    ("human", "Catégorie : {waste_category}\nDétails : {waste_details}")
])
