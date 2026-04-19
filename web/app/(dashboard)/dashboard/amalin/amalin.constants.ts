import type { AuditConfig } from "./types"

export const conversationStarters = [
  "Audit a phosphogypsum recycling project in Gabes Industrial Zone",
  "Analyze a chemical waste treatment facility with 2.5M EUR budget",
  "Check compliance for an air quality monitoring network",
  "Review ROI for industrial wastewater purification system",
  "Configure audit: focus on legal compliance only",
  "Help me understand the audit process",
]

export const defaultAuditConfig: AuditConfig = {
  analysis_depth: "comprehensive",
  enabled_agents: ["law", "roi", "game_theory", "scientific"],
  output_format: "detailed",
  focus_areas: [],
}
