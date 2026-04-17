# Coding Rules (Backend)

THIS TO BE FOLLOWED WHEN WORKING ON `/backend`.

## Purpose

This file is the source of truth for backend implementation rules in this repository. Any agent or contributor must follow these rules unless explicitly overridden by the user.

## Core Principles

- Keep features isolated and modular. Avoid cross-feature coupling.
- Prefer explicit structure over convenience helpers hidden in unrelated files.
- Keep files narrow in scope. One file = one responsibility.
- Favor small, composable services and simple routing layers.

## Project Layout

- The backend lives under `backend/`.
- The FastAPI entrypoint is `backend/main.py`.
- Features live under `backend/features/`.
- Shared helpers live under `backend/utils/`.

## Feature Architecture

- Each feature has its own folder: `backend/features/<feature_name>/`.
- Each feature must include:
  - `routes.py` for HTTP endpoints and request/response wiring.
  - `service.py` for business logic.
- Additional files (schemas, models, repositories, etc.) may be added under the feature folder as needed.
- Feature services may use utilities but should not import from other features directly.

## Routes

- Use `fastapi.APIRouter` with explicit `prefix` and `tags`.
- Keep routes thin: validate input, call service, return response.
- Avoid side effects in routes. Put logic in `service.py` or feature-level helpers.

## Services

- Services contain business logic only.
- Services should be pure where possible and easy to test.
- Do not access request/response objects inside services.

## Utilities

- Shared helpers go under `backend/utils/`.
- Organize utils by domain (e.g., `utils/db`, `utils/auth`, `utils/logging`).
- Utilities must not import feature modules.

## Dependencies

- Use `backend/requirements.txt` for dependencies unless instructed otherwise.
- Keep dependencies minimal and justified.

## Error Handling

- Use FastAPI `HTTPException` for expected errors.
- Define custom exceptions within features if needed.
- Avoid leaking internal errors in responses.

## Configuration

- Use environment variables for secrets and runtime configuration.
- Do not hardcode secrets or API keys.

## Prompt Transparency

- Every prompt used in the project must be logged in `PROMPTS.md` at the repository root.
- Every prompt log entry must include a short summary of the assistant reply.

## Current Non-Goal

- Do not introduce tests unless the user explicitly asks.

## Delivery Standard

- New code must follow this structure.
- If a change conflicts with these rules, prefer the rules unless the user explicitly overrides them.
