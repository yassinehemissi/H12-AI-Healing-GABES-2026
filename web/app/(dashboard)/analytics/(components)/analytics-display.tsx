import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartContainer from "./chart-container";
import { InsightsPanel } from "./insights-panel";
import type { AnalyticsResponse } from "../analytics.types";

interface AnalyticsDisplayProps {
  response: AnalyticsResponse;
}

export function AnalyticsDisplay({ response }: AnalyticsDisplayProps) {
  const { visualizations } = response;

  return (
    <div className="flex flex-col gap-6">
      <InsightsPanel response={response} />

      {visualizations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-normal">
              No visualizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The response did not include any chart visualizations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visualizations.map((viz, index) => (
            <Card key={`${viz.title}-${index}`}>
              <CardContent className="pt-6">
                <ChartContainer visualization={viz} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
