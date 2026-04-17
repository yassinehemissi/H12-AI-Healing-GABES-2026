# Introduction

This is the work of Synaptech team for the H12 Hackathon by ESPRIT

# Project Idea

***TBA***

# Project Structure

- /web : contains the next js web application serving our full ui
- /backend: serving our fastapi backend using multiple services 
- /others: containing other assets connected to the project
- /vibe: containing vibe coding related folders 

# How to run the project

## Web (Next.js)

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

# Backend (FastAPI)

## Local run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Docker / Railway

```bash
docker build -t h12-backend .
docker run -p 8000:8000 h12-backend
```

## Hello World

`GET /hello/` returns `{ "message": "Hello, world!" }`.


# Team Members

- Aziza Naffeti
- Anas Nguira
- Amal Ben Amor
- Houssem Somai
- Khouloud Khechim
- Mohamed Yassine Hemissi
