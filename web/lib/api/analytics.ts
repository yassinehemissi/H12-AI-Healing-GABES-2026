// lib/api/analytics.ts

export type {
  ChartType,
  ChartVisualization,
  AnalyticsResponse,
  AnalyticsQueryRequest,
  AnalyticsState,
} from "@/app/(dashboard)/analytics/analytics.types";

import type { AnalyticsResponse } from "@/app/(dashboard)/analytics/analytics.types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * POST /analytics/generate
 * Throws Error with HTTP status code on non-200 responses.
 * Throws Error with the `error` field when the response has success: false.
 */
export async function fetchAnalyticsData(
  userPrompt: string
): Promise<AnalyticsResponse> {
  const res = await fetch(`${BACKEND_URL}/analytics/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_prompt: userPrompt }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Analytics API error: ${res.status}`);
  }

  const data: AnalyticsResponse = await res.json();

  if (!data.success) {
    throw new Error(data.error ?? "Analytics request failed");
  }

  return data;
}

/**
 * GET /analytics/health
 * Returns true on HTTP 200, false otherwise.
 */
export async function checkAnalyticsHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/health`, {
      cache: "no-store",
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
