import type { Message, ProjectPayload } from "./types"

export function parseUserIntent(message: string): "configuration" | "audit_request" | "help" {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("configure") || lowerMessage.includes("settings")) {
    return "configuration"
  }

  if (
    lowerMessage.includes("audit") ||
    lowerMessage.includes("analyze") ||
    lowerMessage.includes("review")
  ) {
    return "audit_request"
  }

  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("how") ||
    lowerMessage.includes("what")
  ) {
    return "help"
  }

  return "audit_request"
}

export function extractProjectFromDescription(description: string): ProjectPayload {
  const lowerDesc = description.toLowerCase()
  const name = description.split(/[.!?]/)[0].trim()

  let location = "Gabes"
  if (lowerDesc.includes("industrial zone")) location = "Gabes Industrial Zone"
  if (lowerDesc.includes("coastal")) location = "Gabes Coastal Zone"

  let pollution_type = "industrial"
  if (lowerDesc.includes("phosphogypsum") || lowerDesc.includes("waste")) {
    pollution_type = "waste"
  }
  if (lowerDesc.includes("chemical")) pollution_type = "chemical"
  if (lowerDesc.includes("water")) pollution_type = "water"

  const budgetMatch = description.match(
    /(\d+(?:\.\d+)?)\s*(?:\u20ac|eur|euro|euros|M|million)/i
  )
  let budget = undefined
  if (budgetMatch) {
    const amount = Number.parseFloat(budgetMatch[1])
    budget = budgetMatch[0].toLowerCase().includes("m") ? amount * 1_000_000 : amount
  }

  return {
    name,
    description,
    location,
    pollution_type,
    estimated_budget: budget,
    timeline_months: undefined,
    stakeholders: [],
    technologies: [],
  }
}

export function getApiBaseUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  return (configuredApiUrl || "http://localhost:8000").replace(/\/+$/, "")
}

export function getConversationWindow(messages: Message[]) {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content,
  }))
}
