import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AnalyticsResponse } from "../analytics.types";

interface InsightsPanelProps {
  response: AnalyticsResponse;
}

export function InsightsPanel({ response }: InsightsPanelProps) {
  const { query_interpretation, insights, summary, data_sources } = response;

  return (
    <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Query interpretation */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Interprétation de la requête
          </p>
          <p className="text-sm">{query_interpretation}</p>
        </div>

        <Separator />

        {/* Insights */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Analyse
          </p>
          <p className="text-sm leading-relaxed">{insights}</p>
        </div>

        {/* Optional summary */}
        {summary && (
          <>
            <Separator />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Résumé
              </p>
              <p className="text-sm text-muted-foreground">{summary}</p>
            </div>
          </>
        )}

        {/* Optional data sources */}
        {data_sources && data_sources.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sources de données
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data_sources.map((source) => (
                  <Badge key={source} variant="secondary">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
