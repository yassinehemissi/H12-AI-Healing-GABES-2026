# GABBIEST - AI Healing Gabes (H12 Hackathon)

GABBIEST is a nonprofit initiative built during the **H12 Hackathon: AI Healing Gabes**.

Our mission is to help profitable companies improve CSR performance through:
- CSR dashboarding and environmental monitoring
- AI-assisted audit workflows
- investment visibility for CSR receipts so organizations can fund internal R&D for high-impact CSR projects that are often non-profitable but critical for pollution reduction

The project is focused on **Gabes, Tunisia**, where pollution challenges require practical, data-driven collaboration between industry, citizens, and local innovation actors.

## Why the name "GABBIEST"?

The name comes from *gabby* (superlative form inspiration): we aim to be the platform that is the most vocal, transparent, and proactive about pollution-fighting actions in Gabes.

## What is in this repository?

- `web/`: Next.js application (landing, auth, dashboard, analytics, map, investment views)
- `backend/`: FastAPI services (audit, analytics, analysis, scraping, data seeding)
- `RSE PROJECTS CODE/`: related CSR project prototypes (SmartWaste, NH3 resilience, mobile and eco modules)
- `vibe/`: coding guidance and internal workflow docs

## Core capabilities

- Enterprise and citizen dashboard modes
- Pollution and CSR scoring views
- AI-assisted project audit endpoint (`/audit`)
- Analytics generation from prompt (`/analytics/generate`)
- Scraping pipeline and status endpoints (`/scraping/*`)
- CSR recommendations and company ranking endpoints (`/analysis/*`)

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind
- Backend: FastAPI, Python, LangChain/LangGraph
- Database: MongoDB (used by both web auth data and backend datasets)

## Local setup

## 1. Prerequisites

- Node.js + npm
- Python 3.10+
- MongoDB (local or remote URI)

## 2. Environment variables

### `web/.env.local`

```env
MONGODB_URI=mongodb://localhost:27017/h12_gabes
SESSION_SECRET=change-me
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Optional (for Amalin route):

```env
NEXT_PUBLIC_AMALIN_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=h12_gabes
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=INFO
```

Optional AI/API keys (used by some features when available):

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=https://tokenfactory.esprit.tn/api
OPENAI_MODEL=hosted_vllm/llava-1.5-7b-hf
MISTRAL_API=
MISTRAL_MODEL=codestral-latest
OPENROUTER_API=
OPENROUTER_MODEL=mistral/codestral-moe-7b
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_TITLE=H12 AI Healing Analytics
TAVILY_API_KEY=
```

## 3. Run backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

## 4. Run web app

```bash
cd web
npm install
npm run dev
```

Web app: `http://localhost:3000`

## API overview

- `GET /hello/`
- `POST /audit/`
- `POST /audit/stream`
- `GET /audit/health`
- `GET /analysis/dashboard`
- `GET /analysis/pollution-trends`
- `GET /analysis/companies`
- `GET /analysis/recommendations/{company_name}`
- `GET /analysis/ai-recommendations/{company_name}`
- `POST /scraping/run`
- `GET /scraping/status`
- `GET /scraping/data/companies`
- `GET /scraping/data/news`
- `POST /analytics/generate`
- `GET /analytics/health`

## Team (Synaptech)

- Aziza Naffeti
- Anas Nguira
- Amal Ben Amor
- Houssem Somai
- Khouloud Khechim
- Mohamed Yassine Hemissi
