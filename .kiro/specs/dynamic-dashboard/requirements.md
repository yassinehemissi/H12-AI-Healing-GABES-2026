# Requirements Document

## Introduction

The dynamic dashboard feature enables users to query their environmental and RSE (Responsabilité Sociétale des Entreprises) data using natural language prompts and receive AI-generated chart visualizations and textual insights in return. The feature is extracted from the LunarHackathon2026 prototype (microservices analytics module) and adapted for the H12 AI Healing Gabès platform, which monitors industrial pollution and RSE scores for companies in the Gabès region of Tunisia.

The backend (Python/FastAPI) will expose a new `/analytics` router that accepts a natural language prompt, queries MongoDB for relevant data, calls an LLM (Codestral via Mistral API with OpenRouter fallback), parses the structured JSON response, and returns chart specifications and insights. The frontend (Next.js 16 / React 19) will render a prompt input panel alongside a dynamic grid of Recharts visualizations and an insights panel.

## Glossary

- **Analytics_Router**: The FastAPI router at `/analytics` that handles dynamic dashboard requests.
- **Analytics_Service**: The Python service that orchestrates context preparation, LLM calls, response parsing, and validation.
- **MongoDB_Query_Service**: The Python module that fetches collection data and schema from MongoDB and formats it for the LLM prompt.
- **LLM**: Large Language Model (Codestral via Mistral API or OpenRouter fallback) used to interpret queries and generate chart specifications.
- **AnalyticsResponse**: The structured JSON response containing `success`, `query_interpretation`, `visualizations`, `insights`, `summary`, `data_sources`, and optionally `error`.
- **ChartVisualization**: A single chart specification containing `chart_type`, `title`, `description`, `data_points`, `x_axis`, `y_axis`, and optional `colors`.
- **Prompt_Input**: The frontend textarea component where users type natural language queries.
- **Analytics_Display**: The frontend component that renders the grid of charts and the insights panel.
- **Dashboard_Page**: The Next.js page at `/dashboard/analytics` that hosts the dynamic dashboard UI.
- **Analytics_API_Client**: The TypeScript module in `lib/api/analytics.ts` that calls the backend `/analytics/generate` endpoint.

---

## Requirements

### Requirement 1: Analytics Endpoint

**User Story:** As a platform user, I want to submit a natural language query about environmental or RSE data, so that I can receive AI-generated chart visualizations and insights without writing any queries manually.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/analytics/generate` with a valid `user_prompt`, THE Analytics_Router SHALL return an `AnalyticsResponse` with `success: true`, at least one `ChartVisualization`, a non-empty `insights` string, and a `query_interpretation` string.
2. WHEN a POST request is sent to `/analytics/generate` with an empty or whitespace-only `user_prompt`, THE Analytics_Router SHALL return HTTP 400 with a descriptive error message.
3. WHEN a GET request is sent to `/analytics/health`, THE Analytics_Router SHALL return HTTP 200 with `{"status": "healthy"}`.
4. THE Analytics_Router SHALL be registered in the backend `main.py` under the `/analytics` prefix with the `Analytics` tag.

---

### Requirement 2: MongoDB Context Preparation

**User Story:** As a developer, I want the analytics service to automatically fetch relevant data from MongoDB and format it for the LLM, so that the generated charts reflect the actual platform data.

#### Acceptance Criteria

1. WHEN `prepare_analytics_context` is called, THE MongoDB_Query_Service SHALL fetch sample documents (up to 50) and document count from each configured collection.
2. WHEN `get_collection_schema` is called on a non-empty collection, THE MongoDB_Query_Service SHALL return a schema dict mapping each field name to its Python type name.
3. WHEN `format_context_for_llm` is called with a context dict, THE MongoDB_Query_Service SHALL return a formatted string that includes collection names, document counts, schema fields, and up to 3 sample documents per collection.
4. IF a MongoDB collection is unreachable or raises an exception, THEN THE MongoDB_Query_Service SHALL return a partial result with `document_count: 0` and an `error` field, without raising an unhandled exception.

---

### Requirement 3: LLM Integration

**User Story:** As a developer, I want the analytics service to call the Codestral LLM with a structured prompt and parse the JSON response, so that chart specifications are generated reliably.

#### Acceptance Criteria

1. WHEN `call_llm_api` is called with a valid prompt and context, THE Analytics_Service SHALL first attempt the Mistral API using the `MISTRAL_API` environment variable and `MISTRAL_MODEL` (default: `codestral-latest`).
2. IF the Mistral API call fails or `MISTRAL_API` is not set, THEN THE Analytics_Service SHALL fall back to the OpenRouter API using the `OPENROUTER_API` environment variable and `OPENROUTER_MODEL` (default: `mistral/codestral-moe-7b`).
3. IF both providers fail, THEN THE Analytics_Service SHALL return a failure dict with a combined error message describing both failures.
4. WHEN `parse_llm_response` is called with a valid JSON string (possibly wrapped in markdown), THE Analytics_Service SHALL extract and parse the JSON object and return `{"success": True, "data": <parsed_dict>}`.
5. WHEN `parse_llm_response` is called with a string that contains no valid JSON object, THE Analytics_Service SHALL return `{"success": False, "error": <description>}`.

---

### Requirement 4: Response Validation and Building

**User Story:** As a developer, I want the analytics service to validate and normalize the LLM output into a typed response, so that the frontend always receives a consistent schema.

#### Acceptance Criteria

1. WHEN `validate_and_build_response` is called with valid parsed data, THE Analytics_Service SHALL return an `AnalyticsResponse` with `success: true` and all `ChartVisualization` objects constructed from the LLM output.
2. WHEN `validate_and_build_response` is called with `None` or empty parsed data, THE Analytics_Service SHALL return an `AnalyticsResponse` with `success: false` and a non-empty `error` field.
3. THE Analytics_Service SHALL accept `chart_type` values of `"bar"`, `"line"`, `"pie"`, `"area"`, and `"scatter"` only; any other value SHALL default to `"bar"`.
4. THE Analytics_Service SHALL populate `data_sources` in the response with the names of the MongoDB collections that were queried.

---

### Requirement 5: Frontend Analytics API Client

**User Story:** As a frontend developer, I want a typed TypeScript API client for the analytics endpoint, so that the dashboard page can fetch data with proper error handling and authentication.

#### Acceptance Criteria

1. THE Analytics_API_Client SHALL export a `fetchAnalyticsData(userPrompt: string): Promise<AnalyticsResponse>` function that POSTs to `${NEXT_PUBLIC_BACKEND_URL}/analytics/generate`.
2. WHEN `fetchAnalyticsData` is called and the backend returns HTTP 200 with `success: false`, THE Analytics_API_Client SHALL throw an `Error` with the response `error` field as the message.
3. WHEN `fetchAnalyticsData` is called and the backend returns a non-200 status, THE Analytics_API_Client SHALL throw an `Error` with a message including the HTTP status code.
4. THE Analytics_API_Client SHALL export a `checkAnalyticsHealth(): Promise<boolean>` function that GETs `/analytics/health` and returns `true` on HTTP 200, `false` otherwise.
5. THE Analytics_API_Client SHALL export the TypeScript types `AnalyticsResponse`, `ChartVisualization`, `AnalyticsQueryRequest`, and `ChartType`.

---

### Requirement 6: Prompt Input Component

**User Story:** As a user, I want a prompt input panel with example queries, so that I can easily ask questions about the data without knowing the exact phrasing.

#### Acceptance Criteria

1. THE Prompt_Input SHALL render a `<textarea>` for free-text entry and a submit button labeled "Analyze".
2. WHEN a user submits a prompt with fewer than 5 non-whitespace characters, THE Prompt_Input SHALL display an inline validation error and SHALL NOT call the submit handler.
3. WHEN a user submits a whitespace-only prompt, THE Prompt_Input SHALL display an inline validation error and SHALL NOT call the submit handler.
4. THE Prompt_Input SHALL display at least 3 example prompt buttons that, when clicked, populate the textarea with the example text.
5. WHILE the analytics request is loading, THE Prompt_Input SHALL disable the textarea and submit button and display a loading indicator.

---

### Requirement 7: Analytics Display and Chart Rendering

**User Story:** As a user, I want to see the generated charts and insights rendered clearly, so that I can interpret the data at a glance.

#### Acceptance Criteria

1. WHEN an `AnalyticsResponse` with `success: true` is received, THE Analytics_Display SHALL render one `ChartContainer` per `ChartVisualization` in a responsive grid layout.
2. THE Analytics_Display SHALL render a `bar` chart type using Recharts `BarChart`, a `line` chart using `LineChart`, a `pie` chart using `PieChart`, an `area` chart using `AreaChart`, and a `scatter` chart using `ScatterChart`.
3. THE Analytics_Display SHALL render an `InsightsPanel` showing `query_interpretation`, `insights`, optional `summary`, and optional `data_sources`.
4. WHEN `data_points` is empty for a given `ChartVisualization`, THE Analytics_Display SHALL render a "No data available" placeholder card instead of an empty chart.
5. WHEN the analytics request is in progress, THE Analytics_Display SHALL render a `LoadingState` component with a spinner and descriptive message.
6. WHEN the analytics request returns an error, THE Analytics_Display SHALL render an `ErrorState` component with the error message and a retry button.

---

### Requirement 8: Dashboard Page Integration

**User Story:** As a user, I want to access the dynamic analytics dashboard from the main navigation, so that I can use it as part of the existing platform.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL be accessible at the route `/dashboard/analytics` within the existing `(dashboard)` layout group.
2. THE Dashboard_Page SHALL render the `Prompt_Input` in a sticky left column and the `Analytics_Display` in a wider right column on large screens.
3. WHEN no query has been submitted yet, THE Dashboard_Page SHALL render an empty-state placeholder with a descriptive message.
4. THE Dashboard_Page SHALL set the page `<title>` to `"Analytics Dashboard | H12 AI Healing"`.
