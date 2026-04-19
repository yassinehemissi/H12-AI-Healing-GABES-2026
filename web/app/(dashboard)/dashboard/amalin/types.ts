export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  type?: "audit_result" | "configuration" | "clarification" | "system"
  data?: unknown
}

export interface AuditResult {
  project_name: string
  overall_score: number
  overall_risk_level: string
  executive_summary: string
  priority_actions: string[]
  law_analysis: {
    compliance_status: string
    risk_level: string
  }
  roi_analysis: {
    profitability_score: number
    npv: number
    irr: number
  }
  scientific_analysis: {
    technology_feasibility: string
    infrastructure_compatibility: string
  }
  consulted_agents?: string[]
  inquiry_intent?: string
  agent_summaries?: Array<{
    agent: string
    executive_summary: string
  }>
  agent_outputs?: Record<
    string,
    {
      agent: string
      system_message: string
      executive_summary: string
      findings: string[]
      assumptions: string[]
      risks: string[]
      recommendations: string[]
      confidence: string
      sources: Array<{
        title: string
        url: string
        snippet: string
      }>
    }
  >
}

export interface AuditConfig {
  analysis_depth: "basic" | "standard" | "comprehensive"
  enabled_agents: string[]
  output_format: "summary" | "detailed" | "full_report"
  focus_areas: string[]
}

export interface ProjectPayload {
  name: string
  description: string
  location: string
  pollution_type: string
  estimated_budget: number | undefined
  timeline_months: number | undefined
  stakeholders: string[]
  technologies: string[]
}

export interface StreamEventPayload {
  event?: string
  node?: string
  label?: string
  detail?: string
  summary?: {
    executive_summary?: string
    findings?: string[]
    recommendations?: string[]
  }
  result?: AuditResult
}

export interface StoredAuditCard {
  id: string
  prompt: string
  analysisDepth: string
  inquiryIntent?: string
  consultedAgents?: string[]
  result: AuditResult
  createdAt: string
  updatedAt: string
}

export interface AuditListResponse {
  audits: StoredAuditCard[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}
