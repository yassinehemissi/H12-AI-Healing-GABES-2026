from langchain_core.prompts import ChatPromptTemplate

ANALYZE_POLLUTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu es un expert en qualité de l'air spécialisé dans la région de Gabès, Tunisie.
Analyse les données de pollution fournies et identifie les anomalies par rapport aux seuils OMS.
Réponds en JSON structuré uniquement, avec les clés exactes suivantes :
- "anomalies_detected": liste de strings décrivant les anomalies.
- "alert_level": un string parmi ("vert", "jaune", "orange", "rouge").
- "pollution_summary": dictionnaire par polluant (SO2, PM2.5, NO2) avec value, unit, status, et seuil_OMS."""),
    ("human", """
Données de pollution pour {location} :
{pollution_data}

Rapports citoyens récents :
{citizen_reports}

AQI calculé : {aqi_score}

Identifie les polluants problématiques, les anomalies, et le niveau d'alerte global.
""")
])

GENERATE_ALERT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "Tu es un communicateur public. Génère un message d'alerte clair et simple pour les citoyens de Gabès. Réponds uniquement par le texte de l'alerte."),
    ("human", "Le niveau d'alerte est {alert_level} pour la zone {location} à cause des anomalies : {anomalies_detected}. Rédige une alerte courte et percutante.")
])

GENERATE_RECOMMENDATIONS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu es un conseiller de santé publique. Génère une liste de recommandations sanitaires adaptées au profil de l'utilisateur. 
Réponds en JSON structuré uniquement, avec une clé "recommendations" contenant une liste de strings."""),
    ("human", """
Niveau d'alerte : {alert_level}
Anomalies : {anomalies_detected}
Profil utilisateur : Âge = {age_group}, Vulnérabilités = {vulnerabilities}.

Quelles sont tes recommandations ?
""")
])

CATEGORIZE_REPORTS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """Tu analyses des signalements citoyens de Gabès.
Catégorise chaque signalement en : odeur_chimique | fumee_noire | fumee_blanche | deversement_liquide | bruit_anormal | autre.
Réponds UNIQUEMENT par un tableau JSON contenant des objets avec "id", "category" et "severity" (1-5).
Exemple: [{{"id": "RPT-001", "category": "odeur_chimique", "severity": 4}}]"""),
    ("human", "Signalements : {reports}")
])
