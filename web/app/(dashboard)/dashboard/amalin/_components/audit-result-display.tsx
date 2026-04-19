import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import type { AuditResult } from "../types"

type AuditResultDisplayProps = {
  result: AuditResult
}

export function AuditResultDisplay({ result }: AuditResultDisplayProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Overall Score: {result.overall_score.toFixed(1)}/100
          </p>
          <Badge
            className={`mt-1 ${
              result.overall_risk_level === "low"
                ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                : result.overall_risk_level === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300"
                  : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
            }`}
          >
            {result.overall_risk_level.toUpperCase()} RISK
          </Badge>
        </div>
        <Progress value={result.overall_score} className="h-2 w-24" />
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        <p>
          <strong>Executive Summary:</strong> {result.executive_summary}
        </p>
      </div>

      <div className="grid gap-2 text-xs text-zinc-700 dark:text-zinc-200">
        <p>
          <strong>Legal:</strong> {result.law_analysis.compliance_status} (
          {result.law_analysis.risk_level})
        </p>
        <p>
          <strong>Financial:</strong> Score {result.roi_analysis.profitability_score.toFixed(1)}
          /100
        </p>
        <p>
          <strong>Technical:</strong> {result.scientific_analysis.technology_feasibility}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Priority Actions:</p>
        <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          {result.priority_actions.slice(0, 3).map((action, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-xs dark:bg-white/10">
                {index + 1}
              </span>
              {action}
            </li>
          ))}
        </ul>
      </div>

      {result.agent_summaries && result.agent_summaries.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium">Agent Summaries:</p>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
            {result.agent_summaries.slice(0, 4).map((item, index) => (
              <li key={`${item.agent}-${index}`}>
                <strong className="capitalize">{item.agent}:</strong> {item.executive_summary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.agent_outputs ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Detailed Agent Outputs:</p>
          {Object.entries(result.agent_outputs).map(([agentKey, output]) => (
            <div
              key={agentKey}
              className="rounded-xl border border-zinc-900/10 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/20"
            >
              <p className="font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {output.agent.replace("_", " ")}
              </p>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">{output.executive_summary}</p>
              {output.findings?.length ? (
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  {output.findings.slice(0, 4).map((finding, index) => (
                    <li key={`finding-${agentKey}-${index}`}>- {finding}</li>
                  ))}
                </ul>
              ) : null}
              {output.recommendations?.length ? (
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  {output.recommendations.slice(0, 3).map((recommendation, index) => (
                    <li key={`rec-${agentKey}-${index}`}>- {recommendation}</li>
                  ))}
                </ul>
              ) : null}
              {output.sources?.length ? (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {output.sources.slice(0, 3).map((source, index) => (
                    <p key={`src-${agentKey}-${index}`}>
                      Source:{" "}
                      <a
                        className="underline underline-offset-2"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.title}
                      </a>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
