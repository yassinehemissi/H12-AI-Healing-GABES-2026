# Implementation Plan: Dynamic Dashboard

## Overview

Extract the dynamic dashboarding logic from LunarHackathon2026 and implement it in the backend (Python/FastAPI) and web (Next.js/React) projects. The backend gets a new `features/analytics/` module; the frontend gets a new `/dashboard/analytics` page with prompt input and Recharts-based chart rendering.

## Tasks

- [x] 1. Backend — Create the analytics feature module
  - [x] 1.1 Create `backend/features/analytics/__init__.py` and `backend/features/analytics/schemas.py`
    - Define `AnalyticsQueryRequest`, `ChartVisualization`, and `AnalyticsResponse` Pydantic models
    - `ChartVisualization.chart_type` must be `Literal["bar", "line", "pie", "area", "scatter"]`
    - _Requirements: 1.1, 4.1, 4.3_

  - [ ]* 1.2 Write property test for response shape invariant (Property 4)
    - Use `hypothesis` to generate random valid LLM data dicts
    - Assert `AnalyticsResponse` has `success=True`, non-empty `query_interpretation`, valid `chart_type` on each visualization
    - `# Feature: dynamic-dashboard, Property 4: response shape invariant`
    - _Requirements: 4.1, 4.3_

- [x] 2. Backend — MongoDB Query Service
  - [x] 2.1 Create `backend/features/analytics/mongodb_query_service.py`
    - Implement `fetch_collection_data(collection_name, limit=50)` using the existing `db` module
    - Implement `get_collection_schema(collection_name)` that infers field → type name from a sample document
    - Implement `prepare_analytics_context()` that queries `pollution_metrics`, `rse_scores`, and `companies` collections
    - Implement `format_context_for_llm(context)` that produces a readable string with collection names, counts, schema, and up to 3 sample docs
    - Handle MongoDB exceptions gracefully: return `{"document_count": 0, "error": str(e)}` without raising
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test for context format completeness (Property 6)
    - Use `hypothesis` to generate random context dicts with varying collection names and schemas
    - Assert the formatted string contains each collection name and at least one field name
    - `# Feature: dynamic-dashboard, Property 6: context format completeness`
    - _Requirements: 2.3_

  - [ ]* 2.3 Write property test for schema field type mapping (Property 7)
    - Use `hypothesis` to generate random dicts with varying field types
    - Assert `get_collection_schema` returns exactly N entries mapping field names to type name strings
    - `# Feature: dynamic-dashboard, Property 7: schema field type mapping`
    - _Requirements: 2.2_

- [x] 3. Backend — LLM Service
  - [x] 3.1 Create `backend/features/analytics/service.py`
    - Implement `_build_messages(prompt, context)` that constructs the system + user messages for the LLM
    - Implement `call_llm_api(prompt, context)` with Mistral primary (`MISTRAL_API` env var, model `MISTRAL_MODEL`) and OpenRouter fallback (`OPENROUTER_API` env var, model `OPENROUTER_MODEL`)
    - Implement `parse_llm_response(response_text)` that extracts the first `{...}` JSON block from the text
    - Implement `validate_and_build_response(parsed_data, query_interpretation, user_prompt)` that builds `AnalyticsResponse`; unknown `chart_type` values default to `"bar"`
    - Implement `generate_analytics(user_prompt)` as the top-level orchestrator
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 3.2 Write property test for LLM JSON parse round-trip (Property 2)
    - Use `hypothesis` to generate random JSON-serializable dicts, optionally wrap in markdown fences
    - Assert `parse_llm_response` returns `{"success": True, "data": <original>}`
    - `# Feature: dynamic-dashboard, Property 2: LLM JSON parse round-trip`
    - _Requirements: 3.4_

  - [ ]* 3.3 Write property test for invalid JSON parse failure (Property 3)
    - Use `hypothesis` to generate strings with no `{` character
    - Assert `parse_llm_response` returns `{"success": False, "error": <non-empty>}`
    - `# Feature: dynamic-dashboard, Property 3: invalid JSON parse failure`
    - _Requirements: 3.5_

  - [ ]* 3.4 Write property test for unknown chart_type defaults to bar (Property 5)
    - Use `hypothesis` to generate strings not in `{"bar","line","pie","area","scatter"}`
    - Assert `validate_and_build_response` produces `ChartVisualization` with `chart_type == "bar"`
    - `# Feature: dynamic-dashboard, Property 5: unknown chart_type defaults to bar`
    - _Requirements: 4.3_

  - [ ]* 3.5 Write unit tests for LLM service edge cases
    - Test `validate_and_build_response(None, ...)` returns `success=False` with non-empty `error`
    - Test `call_llm_api` falls back to OpenRouter when Mistral is not configured
    - Test both providers failing returns combined error message
    - _Requirements: 3.2, 3.3, 4.2_

- [x] 4. Backend — Analytics Router and Registration
  - [x] 4.1 Create `backend/features/analytics/routes.py`
    - Implement `POST /generate` endpoint: validate `user_prompt` is non-empty/non-whitespace (HTTP 400 if not), call `generate_analytics`, return `AnalyticsResponse`
    - Implement `GET /health` endpoint returning `{"status": "healthy"}`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 Register the analytics router in `backend/main.py`
    - Import `analytics_router` from `features.analytics.routes`
    - Add `app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])`
    - _Requirements: 1.4_

  - [ ]* 4.3 Write property test for whitespace prompt rejection (Property 1 — backend)
    - Use `hypothesis` to generate whitespace-only strings and strings with < 5 non-whitespace chars
    - Assert the endpoint returns HTTP 400
    - `# Feature: dynamic-dashboard, Property 1: whitespace prompt rejection`
    - _Requirements: 1.2_

  - [ ]* 4.4 Write unit test for health endpoint
    - Assert `GET /analytics/health` returns HTTP 200 and `{"status": "healthy"}`
    - _Requirements: 1.3_

- [x] 5. Checkpoint — Backend tests pass
  - Ensure all backend tests pass. Run `pytest backend/features/analytics/` and confirm no failures. Ask the user if questions arise.

- [x] 6. Frontend — TypeScript types and API client
  - [x] 6.1 Create `web/app/(dashboard)/analytics/analytics.types.ts`
    - Define `ChartType`, `ChartVisualization`, `AnalyticsResponse`, `AnalyticsQueryRequest`, `AnalyticsState`
    - _Requirements: 5.5_

  - [x] 6.2 Create `web/app/(dashboard)/analytics/analytics.constants.ts`
    - Define `EXAMPLE_PROMPTS` (at least 5 prompts relevant to Gabès pollution/RSE data)
    - Define `SAMPLE_CHART_COLORS`, `LOADING_MESSAGE`, `ERROR_TITLE`, `EMPTY_STATE_MESSAGE`
    - _Requirements: 6.4_

  - [x] 6.3 Create `web/lib/api/analytics.ts`
    - Implement `fetchAnalyticsData(userPrompt)` that POSTs to `${NEXT_PUBLIC_BACKEND_URL}/analytics/generate`
    - Throw `Error` with status code on non-200 responses
    - Throw `Error` with `error` field when `success: false`
    - Implement `checkAnalyticsHealth()` returning `true` on 200, `false` otherwise
    - Export all types from `analytics.types.ts`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.4 Write property test for API client error propagation (Property 8)
    - Use `fast-check` to generate random 4xx/5xx status codes
    - Mock `fetch` to return those status codes
    - Assert `fetchAnalyticsData` throws an `Error` whose message contains the status code
    - `// Feature: dynamic-dashboard, Property 8: API client error propagation`
    - _Requirements: 5.3_

  - [ ]* 6.5 Write unit tests for API client
    - Test `fetchAnalyticsData` throws with `error` field when `success: false` on HTTP 200
    - Test `checkAnalyticsHealth` returns `true` on 200, `false` on 503
    - _Requirements: 5.2, 5.4_

- [x] 7. Frontend — UI Components
  - [x] 7.1 Create `web/app/(dashboard)/analytics/(components)/prompt-input.tsx`
    - Render `<Textarea>`, submit `<Button>` labeled "Analyze", and at least 3 example prompt buttons
    - Validate: reject prompts with < 5 non-whitespace characters or whitespace-only; show inline error
    - Disable textarea and button while `isLoading` is true
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 7.2 Write property test for prompt validation (Property 1 — frontend)
    - Use `fast-check` to generate whitespace-only strings and strings with < 5 non-whitespace chars
    - Render `PromptInput`, simulate submit, assert `onSubmit` is never called
    - `// Feature: dynamic-dashboard, Property 1: whitespace prompt rejection`
    - _Requirements: 6.2, 6.3_

  - [x] 7.3 Create `web/app/(dashboard)/analytics/(components)/chart-container.tsx`
    - Render the correct Recharts component for each `chart_type` (BarChart, LineChart, PieChart, AreaChart, ScatterChart)
    - Render "No data available" placeholder when `data_points` is empty
    - Use `ResponsiveContainer` wrapping each chart
    - _Requirements: 7.2, 7.4_

  - [x] 7.4 Create `web/app/(dashboard)/analytics/(components)/insights-panel.tsx`
    - Render `query_interpretation`, `insights`, optional `summary`, and optional `data_sources` tags
    - _Requirements: 7.3_

  - [x] 7.5 Create `web/app/(dashboard)/analytics/(components)/loading-state.tsx` and `error-state.tsx`
    - `LoadingState`: spinner + `LOADING_MESSAGE`
    - `ErrorState`: destructive alert with error text + optional retry button
    - _Requirements: 7.5, 7.6_

  - [x] 7.6 Create `web/app/(dashboard)/analytics/(components)/analytics-display.tsx`
    - Render `InsightsPanel` + responsive grid of `ChartContainer` components when `success: true`
    - Render "No visualizations" placeholder when `visualizations` is empty
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ]* 7.7 Write property test for analytics display chart count (Property 9)
    - Use `fast-check` to generate arrays of random `ChartVisualization` objects
    - Render `AnalyticsDisplay` with a success response containing N visualizations
    - Assert exactly N `ChartContainer` elements are rendered and `InsightsPanel` contains the insights text
    - `// Feature: dynamic-dashboard, Property 9: analytics display renders one chart per visualization`
    - _Requirements: 7.1, 7.3_

  - [ ]* 7.8 Write unit tests for UI components
    - `PromptInput` renders textarea, submit button, and ≥3 example buttons
    - `PromptInput` disables controls when `isLoading=true`
    - `AnalyticsDisplay` renders `LoadingState` when loading
    - `AnalyticsDisplay` renders `ErrorState` with retry when error is set
    - `AnalyticsDisplay` renders empty-state placeholder when `data` is null
    - `ChartContainer` renders "No data available" when `data_points` is empty
    - _Requirements: 6.1, 6.4, 6.5, 7.4, 7.5, 7.6_

- [x] 8. Frontend — Page and State Orchestration
  - [x] 8.1 Create `web/app/(dashboard)/analytics/(components)/analytics-overview-page.tsx`
    - Manage `AnalyticsState` with `useState`
    - Call `fetchAnalyticsData` on submit, update state accordingly
    - Render `PromptInput` (sticky left column) + `AnalyticsDisplay` (right column) in a responsive grid
    - Render empty-state placeholder when `data` is null and not loading
    - _Requirements: 7.1, 7.5, 7.6, 8.2, 8.3_

  - [x] 8.2 Create `web/app/(dashboard)/analytics/page.tsx`
    - Export `metadata` with `title: "Analytics Dashboard | H12 AI Healing"`
    - Render `AnalyticsOverviewPage` as the page body
    - _Requirements: 8.1, 8.4_

  - [ ]* 8.3 Write unit tests for the dashboard page
    - Assert metadata title equals `"Analytics Dashboard | H12 AI Healing"`
    - Assert empty-state placeholder is rendered on initial load (no data)
    - _Requirements: 8.3, 8.4_

- [x] 9. Final Checkpoint — All tests pass
  - Ensure all backend and frontend tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The backend analytics feature follows the same pattern as `features/analysis/` (schemas, service, routes)
- The frontend follows the same pattern as the LunarHackathon2026 `dashboardi` module, adapted for the H12 project's data (pollution, RSE, companies)
- `MISTRAL_API` and `OPENROUTER_API` environment variables must be added to `backend/.env`
- `recharts` is already in `web/package.json` — no new dependency needed
- `hypothesis` must be added to `backend/requirements.txt` for property tests
- `fast-check` must be added to `web/package.json` for frontend property tests
