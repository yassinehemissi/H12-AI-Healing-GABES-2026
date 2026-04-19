import type { AuditConfig } from "../types"

type ConfigurationDisplayProps = {
  config: AuditConfig
}

export function ConfigurationDisplay({ config }: ConfigurationDisplayProps) {
  return (
    <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
      <p>
        <strong>Analysis Depth:</strong> {config.analysis_depth}
      </p>
      <p>
        <strong>Enabled Agents:</strong> {config.enabled_agents.join(", ")}
      </p>
      <p>
        <strong>Output Format:</strong> {config.output_format}
      </p>
      {config.focus_areas.length > 0 ? (
        <p>
          <strong>Focus Areas:</strong> {config.focus_areas.join(", ")}
        </p>
      ) : null}
    </div>
  )
}
