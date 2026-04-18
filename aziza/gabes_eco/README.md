# 🏗️ GabèsEco Platform

Plateforme backend **FastAPI** multi-agent pour la ville de Gabès :

1. **Transparency Agent** : Analyse des données de pollution et génération d'alertes via LLM.
2. **Recycling Agent** : Identification des déchets et conseils de tri via texte et vision.

## 🚀 Démarrage

1. **Environnement virtuel** :
   ```bash
   python -m venv venv
   # Windows : venv\Scripts\activate
   # Linux/Mac : source venv/bin/activate
   ```

2. **Dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

3. **Configuration** :
   Copiez `.env.example` vers `.env` et ajoutez votre `OPENROUTER_API_KEY`.
   ```bash
   cp .env.example .env
   ```

4. **Lancement** :
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Test** :
   Accédez à Swagger UI : http://localhost:8000/docs
