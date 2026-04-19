# GabesEco Platform

GabesEco est une plateforme backend FastAPI pour la ville de Gabes. Le projet combine transparence environnementale, analyse de dechets, conseils de tri et pipeline d'upcycling dans une seule API.

## Modules

1. `Transparency Agent` : analyse des donnees de pollution et des signalements citoyens.
2. `Recycling Agent` : identifie un dechet a partir d'un texte ou d'une image et retourne des consignes de tri.
3. `Upcycling Pipeline` : a partir d'une image de dechet reutilisable, extrait les materiaux, propose des idees de produits puis genere 3 images du produit choisi.
4. `Orchestrator` : route les requetes utilisateur vers le bon module.

## Flux image unifie

Le flux principal pour une image est maintenant :

1. analyse du dechet ;
2. conseil de tri ;
3. extraction des materiaux et parties reutilisables ;
4. verification de reutilisabilite et des risques ;
5. suggestion d'idees upcyclees si l'objet est eligible ;
6. generation de 3 images quand l'utilisateur choisit une idee.

Si l'objet est dangereux, trop degrade ou non reutilisable, le pipeline s'arrete apres le conseil de tri.

## Endpoints principaux

- `POST /recycling/identify-text` : analyse textuelle d'un dechet.
- `POST /recycling/identify-image` : analyse image + suggestions d'upcycling si l'objet est reutilisable.
- `POST /upcycling/suggest-ideas` : genere des idees a partir de materiaux fournis manuellement.
- `POST /upcycling/generate-images` : genere 3 images pour une idee choisie.
- `POST /orchestrator/chat` : point d'entree unique pour texte ou image.
- `POST /transparency/analyze` : analyse environnementale.
- `POST /transparency/report` : enregistre un signalement citoyen.

## Configuration

Variables utiles dans `.env` :

- `OPENROUTER_API_KEY` : requis pour les appels LLM de recyclage et transparence.
- `OPENAI_API_KEY` : requis pour la generation d'images et optionnellement pour l'ideation.
- `MISTRAL_MODEL`
- `VLM_MODEL`
- `OPENAI_TEXT_MODEL`
- `OPENAI_IMAGE_MODEL`
- `TAVILY_API_KEY`

Un exemple est disponible dans `.env.example`.

## Demarrage

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Documentation :

- Swagger UI : `http://localhost:8000/docs`
- Interface web : `http://localhost:8000/static/index.html`

## Resume

GabesEco expose maintenant une seule API FastAPI pour l'analyse dechets, le tri, l'ideation upcycling et la generation d'images, tout en conservant les fonctionnalites de transparence environnementale.
