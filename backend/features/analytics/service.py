"""
Analytics Service for the dynamic dashboard.

Orchestrates LLM calls (Mistral → OpenRouter fallback), response parsing,
validation, and final AnalyticsResponse construction.
"""

import json
import os
import re
import requests
from typing import Any, Dict, List

from .schemas import AnalyticsResponse, ChartVisualization
from .mongodb_query_service import (
    ANALYTICS_COLLECTIONS,
    prepare_analytics_context,
    format_context_for_llm,
)

# Chart types accepted by the schema; anything else defaults to "bar".
VALID_CHART_TYPES = {"bar", "line", "pie", "area", "scatter"}


# ---------------------------------------------------------------------------
# Message construction
# ---------------------------------------------------------------------------

def _build_messages(prompt: str, context: str) -> List[Dict[str, str]]:
    """Construct the system + user messages list for the LLM chat API."""
    system_prompt = (
        "You are an expert data analyst specialising in environmental monitoring "
        "and RSE (Responsabilité Sociétale des Entreprises) data for industrial "
        "companies in the Gabès region of Tunisia.\n\n"
        "When a user asks a question about the data, you must:\n"
        "1. Interpret their query.\n"
        "2. Determine what data visualisations would be most useful.\n"
        "3. Generate insights based on the data.\n"
        "4. Return a JSON response with the structure specified below.\n\n"
        "IMPORTANT: Return ONLY valid JSON — no markdown fences, no extra text.\n\n"
        "Response format (exact structure required):\n"
        "{\n"
        '  "query_interpretation": "Your understanding of what the user asked",\n'
        '  "visualizations": [\n'
        "    {\n"
        '      "chart_type": "bar|line|pie|area|scatter",\n'
        '      "title": "Chart title",\n'
        '      "description": "What this chart shows",\n'
        '      "data_points": [{"label": "Category", "value": 100}, ...],\n'
        '      "x_axis": "X axis label",\n'
        '      "y_axis": "Y axis label"\n'
        "    }\n"
        "  ],\n"
        '  "insights": "Key findings and insights from the data",\n'
        '  "summary": "Overall analysis summary"\n'
        "}\n\n"
        "Available data:\n"
        + context
    )

    user_message = (
        f"User Query: {prompt}\n\n"
        "Based on the available data above, analyse this query and return the JSON response."
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _extract_chat_content(response_json: Dict[str, Any]) -> Dict[str, Any]:
    """Normalise a chat-completions payload across providers."""
    choices = response_json.get("choices") or []
    if not choices:
        return {
            "success": False,
            "error": f"No choices in response: {response_json}",
            "content": "",
        }

    content = choices[0].get("message", {}).get("content", "")
    if not content:
        return {
            "success": False,
            "error": "Provider returned empty content",
            "content": "",
        }

    return {
        "success": True,
        "content": content,
        "model": response_json.get("model", ""),
        "usage": response_json.get("usage", {}),
    }


# ---------------------------------------------------------------------------
# LLM API call (Mistral → OpenRouter fallback)
# ---------------------------------------------------------------------------

def call_llm_api(prompt: str, context: str = "") -> Dict[str, Any]:
    """
    Call the LLM using Mistral as the primary provider and OpenRouter as fallback.

    Environment variables:
      - MISTRAL_API   : Mistral API key
      - MISTRAL_MODEL : model name (default: codestral-latest)
      - OPENROUTER_API   : OpenRouter API key
      - OPENROUTER_MODEL : model name (default: mistral/codestral-moe-7b)

    Returns a dict with:
      - success (bool)
      - content (str)  — on success
      - error   (str)  — on failure
    """
    messages = _build_messages(prompt, context)

    # --- Primary: Mistral ---
    mistral_api_key = os.getenv("MISTRAL_API")
    mistral_model = os.getenv("MISTRAL_MODEL", "codestral-latest")
    mistral_error: str

    if mistral_api_key:
        try:
            payload = {
                "model": mistral_model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2048,
            }
            headers = {
                "Authorization": f"Bearer {mistral_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            response = requests.post(
                "https://api.mistral.ai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=45,
            )
            response.raise_for_status()
            return _extract_chat_content(response.json())
        except requests.exceptions.RequestException as exc:
            mistral_error = f"Mistral API failed: {exc}"
        except json.JSONDecodeError as exc:
            mistral_error = f"Mistral returned invalid JSON: {exc}"
    else:
        mistral_error = "MISTRAL_API not configured"

    # --- Fallback: OpenRouter ---
    openrouter_api_key = os.getenv("OPENROUTER_API")
    openrouter_model = os.getenv("OPENROUTER_MODEL", "mistral/codestral-moe-7b")
    openrouter_error: str

    if openrouter_api_key:
        try:
            payload = {
                "model": openrouter_model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 2048,
            }
            headers = {
                "Authorization": f"Bearer {openrouter_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "HTTP-Referer": os.getenv("OPENROUTER_REFERER", "http://localhost:3000"),
                "X-Title": os.getenv("OPENROUTER_TITLE", "H12 AI Healing Analytics"),
            }
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=45,
            )
            response.raise_for_status()
            return _extract_chat_content(response.json())
        except requests.exceptions.RequestException as exc:
            openrouter_error = f"OpenRouter API failed: {exc}"
        except json.JSONDecodeError as exc:
            openrouter_error = f"OpenRouter returned invalid JSON: {exc}"
    else:
        openrouter_error = "OPENROUTER_API not configured"

    return {
        "success": False,
        "error": (
            "All LLM providers failed. "
            f"{mistral_error}. {openrouter_error}."
        ),
        "content": "",
    }


# ---------------------------------------------------------------------------
# Response parsing
# ---------------------------------------------------------------------------

def parse_llm_response(response_text: str) -> Dict[str, Any]:
    """
    Extract the first {...} JSON block from the LLM response text.

    Handles markdown code fences and surrounding prose.

    Returns:
      {"success": True,  "data": <parsed dict>}   on success
      {"success": False, "error": <description>}  on failure
    """
    # Find the outermost { ... } span using a simple brace-counting scan
    # so we correctly handle nested objects (unlike rfind which may grab
    # trailing braces from prose).
    start = response_text.find("{")
    if start == -1:
        return {
            "success": False,
            "error": "No JSON object found in LLM response",
        }

    depth = 0
    end = -1
    for i in range(start, len(response_text)):
        ch = response_text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end == -1:
        return {
            "success": False,
            "error": "Unmatched braces in LLM response — could not extract JSON",
        }

    json_str = response_text[start:end]
    try:
        data = json.loads(json_str)
        return {"success": True, "data": data}
    except json.JSONDecodeError as exc:
        return {
            "success": False,
            "error": f"Failed to parse LLM JSON response: {exc}",
        }


# ---------------------------------------------------------------------------
# Validation and response building
# ---------------------------------------------------------------------------

def validate_and_build_response(
    parsed_data: Any,
    query_interpretation: str,
    user_prompt: str,
    data_sources: List[str] | None = None,
) -> AnalyticsResponse:
    """
    Validate parsed LLM data and build the final AnalyticsResponse.

    - None / empty parsed_data → success=False with error message.
    - Unknown chart_type values default to "bar".
    - data_sources is populated from the MongoDB collections that were queried.
    """
    if not parsed_data:
        return AnalyticsResponse(
            success=False,
            query_interpretation=query_interpretation or user_prompt,
            visualizations=[],
            insights="Unable to generate analytics for this query.",
            error="No data returned from LLM",
        )

    try:
        visualizations: List[ChartVisualization] = []
        for viz_data in parsed_data.get("visualizations", []):
            raw_chart_type = viz_data.get("chart_type", "bar")
            chart_type = raw_chart_type if raw_chart_type in VALID_CHART_TYPES else "bar"
            viz = ChartVisualization(
                chart_type=chart_type,
                title=viz_data.get("title", "Chart"),
                description=viz_data.get("description"),
                data_points=viz_data.get("data_points", []),
                x_axis=viz_data.get("x_axis"),
                y_axis=viz_data.get("y_axis"),
                colors=viz_data.get("colors"),
            )
            visualizations.append(viz)

        return AnalyticsResponse(
            success=True,
            query_interpretation=parsed_data.get(
                "query_interpretation", query_interpretation or user_prompt
            ),
            visualizations=visualizations,
            insights=parsed_data.get("insights", ""),
            summary=parsed_data.get("summary"),
            data_sources=data_sources or ANALYTICS_COLLECTIONS,
        )
    except Exception as exc:
        return AnalyticsResponse(
            success=False,
            query_interpretation=query_interpretation or user_prompt,
            visualizations=[],
            insights="",
            error=f"Error building response: {exc}",
        )


# ---------------------------------------------------------------------------
# Top-level orchestrator
# ---------------------------------------------------------------------------

def generate_analytics(user_prompt: str) -> AnalyticsResponse:
    """
    Top-level orchestrator: prepare MongoDB context → call LLM → parse → validate.

    Args:
        user_prompt: Natural language query from the user.

    Returns:
        AnalyticsResponse with visualisations and insights (or error details).
    """
    try:
        # 1. Fetch context from MongoDB
        context_data = prepare_analytics_context()
        formatted_context = format_context_for_llm(context_data)
        data_sources = list(context_data.keys())

        # 2. Call LLM
        llm_response = call_llm_api(user_prompt, formatted_context)

        if not llm_response.get("success"):
            return AnalyticsResponse(
                success=False,
                query_interpretation=user_prompt,
                visualizations=[],
                insights="",
                error=llm_response.get("error", "Unknown LLM error"),
            )

        # 3. Parse JSON from LLM output
        parsed = parse_llm_response(llm_response["content"])

        if not parsed.get("success"):
            return AnalyticsResponse(
                success=False,
                query_interpretation=user_prompt,
                visualizations=[],
                insights="",
                error=parsed.get("error", "Failed to parse LLM response"),
            )

        # 4. Validate and build the typed response
        return validate_and_build_response(
            parsed["data"],
            query_interpretation=user_prompt,
            user_prompt=user_prompt,
            data_sources=data_sources,
        )

    except Exception as exc:
        return AnalyticsResponse(
            success=False,
            query_interpretation=user_prompt,
            visualizations=[],
            insights="",
            error=f"Error generating analytics: {exc}",
        )
