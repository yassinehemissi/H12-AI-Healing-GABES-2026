"use client";

import React, { useState } from "react";
import { PromptInput } from "./prompt-input";
import { AnalyticsDisplay } from "./analytics-display";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";
import { fetchAnalyticsData } from "@/lib/api/analytics";
import { EMPTY_STATE_MESSAGE } from "../analytics.constants";
import type { AnalyticsState } from "../analytics.types";

const INITIAL_STATE: AnalyticsState = {
  loading: false,
  error: null,
  data: null,
  lastPrompt: null,
};

export function AnalyticsOverviewPage() {
  const [state, setState] = useState<AnalyticsState>(INITIAL_STATE);

  async function handleSubmit(prompt: string) {
    setState({ loading: true, error: null, data: null, lastPrompt: prompt });
    try {
      const data = await fetchAnalyticsData(prompt);
      setState({ loading: false, error: null, data, lastPrompt: prompt });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur inattendue s'est produite.";
      setState({ loading: false, error: message, data: null, lastPrompt: prompt });
    }
  }

  function handleRetry() {
    if (state.lastPrompt) {
      handleSubmit(state.lastPrompt);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column — sticky prompt input */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <PromptInput onSubmit={handleSubmit} isLoading={state.loading} />
      </aside>

      {/* Right column — display area */}
      <main className="lg:col-span-2">
        {state.loading && <LoadingState />}

        {!state.loading && state.error && (
          <ErrorState error={state.error} onRetry={handleRetry} />
        )}

        {!state.loading && !state.error && state.data && (
          <AnalyticsDisplay response={state.data} />
        )}

        {!state.loading && !state.error && !state.data && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {EMPTY_STATE_MESSAGE}
          </p>
        )}
      </main>
    </div>
  );
}
