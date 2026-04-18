"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, BrainCircuit, Loader2, Send, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  type?: "audit_result" | "configuration" | "clarification" | "system"
  data?: any
}

interface AuditResult {
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
}

interface AuditConfig {
  analysis_depth: "basic" | "standard" | "comprehensive"
  enabled_agents: string[]
  output_format: "summary" | "detailed" | "full_report"
  focus_areas: string[]
}

const capabilities = [
  {
    title: "Game-theory orchestration",
    description: "Multi-agent negotiation and equilibrium scenario ranking",
    color: "text-indigo-600",
  },
  {
    title: "Laws compliance engine",
    description:
      "Continuous legal checks and policy-aware deployment recommendations",
    color: "text-amber-600",
  },
  {
    title: "Scientific update feed",
    description:
      "Current peer-reviewed data ingestion for strategy recalibration",
    color: "text-cyan-600",
  },
  {
    title: "ROI and audit cockpit",
    description:
      "Investment outcomes, scenario comparison, and automated audit reports",
    color: "text-emerald-600",
  },
  {
    title: "Security controls",
    description: "Role segmentation and signed decision logs",
    color: "text-violet-600",
  },
  {
    title: "Atmosphere simulation",
    description:
      "Predictive atmospheric diffusion models for intervention planning",
    color: "text-sky-600",
  },
]

const conversationStarters = [
  "Audit a phosphogypsum recycling project in Gabes Industrial Zone",
  "Analyze a chemical waste treatment facility with 2.5M EUR budget",
  "Check compliance for an air quality monitoring network",
  "Review ROI for industrial wastewater purification system",
  "Configure audit: focus on legal compliance only",
  "Help me understand the audit process",
]

export default function AmalinCorePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Amalin Core! I'm your multi-agent audit assistant for pollution control projects in Gabes. I can help you analyze projects using legal, financial, stakeholder, and technical perspectives.\n\nTry asking me to audit a project or configure your analysis preferences. Here are some examples:",
      timestamp: new Date(),
      type: "system",
    },
    {
      id: "starters",
      role: "assistant",
      content: conversationStarters.map((starter) => `- ${starter}`).join("\n"),
      timestamp: new Date(),
      type: "system",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [auditConfig] = useState<AuditConfig>({
    analysis_depth: "comprehensive",
    enabled_agents: ["law", "roi", "game_theory", "scientific"],
    output_format: "detailed",
    focus_areas: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageSequenceRef = useRef(0)

  const getNextMessageId = () => {
    const sequence = messageSequenceRef.current++
    return `${Date.now()}-${sequence}`
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: getNextMessageId(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const parseUserIntent = (message: string): { type: string; data: unknown } => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("configure") || lowerMessage.includes("settings")) {
      return { type: "configuration", data: {} }
    }

    if (
      lowerMessage.includes("audit") ||
      lowerMessage.includes("analyze") ||
      lowerMessage.includes("review")
    ) {
      return { type: "audit_request", data: { description: message } }
    }

    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("how") ||
      lowerMessage.includes("what")
    ) {
      return { type: "help", data: {} }
    }

    return { type: "audit_request", data: { description: message } }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    addMessage({ role: "user", content: userMessage })

    setIsProcessing(true)

    try {
      const intent = parseUserIntent(userMessage)

      if (intent.type === "configuration") {
        addMessage({
          role: "assistant",
          content: "Here are your current audit configuration settings:",
          type: "configuration",
          data: auditConfig,
        })
      } else if (intent.type === "help") {
        addMessage({
          role: "assistant",
          content:
            "I can help you audit pollution control projects in Gabes using multiple specialized agents:\n\n- **Law Agent**: Tunisia legal compliance analysis\n- **ROI Agent**: Financial analysis and forecasting\n- **Game Theory Agent**: Stakeholder analysis and decision optimization\n- **Scientific Agent**: Technical feasibility assessment\n\nTry describing a project you'd like to audit, or ask me to configure specific analysis parameters.",
        })
      } else if (intent.type === "audit_request") {
        await performAudit(userMessage)
      }
    } catch {
      addMessage({
        role: "assistant",
        content:
          "I encountered an error processing your request. Please try rephrasing or check your input.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const performAudit = async (description: string) => {
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
    const apiBaseUrl = (configuredApiUrl || "http://localhost:8000").replace(
      /\/+$/,
      ""
    )

    try {
      const projectData = extractProjectFromDescription(description)

      addMessage({
        role: "assistant",
        content: `Starting audit for: ${projectData.name}\n\nConfiguration: ${auditConfig.analysis_depth} analysis with ${auditConfig.enabled_agents.join(", ")} agents enabled.`,
        type: "system",
      })

      const requestData = {
        project: projectData,
        analysis_depth: auditConfig.analysis_depth,
        config: auditConfig,
      }

      const response = await fetch(`${apiBaseUrl}/audit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Audit failed: ${response.statusText}`)
      }

      const result: AuditResult = await response.json()

      addMessage({
        role: "assistant",
        content: `Audit completed successfully! Here's the analysis for "${result.project_name}":`,
        type: "audit_result",
        data: result,
      })

      toast({
        title: "Audit completed",
        description: `Analysis finished for ${result.project_name}`,
      })
    } catch (error) {
      console.error("Audit error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred"
      addMessage({
        role: "assistant",
        content: `The audit could not be completed. Error: ${errorMessage}\n\nPlease check that:\n- The backend server is running\n- NEXT_PUBLIC_API_URL is correct (current: ${apiBaseUrl})\n- CORS allows requests from this web app\n- Try rephrasing your project description`,
      })
      toast({
        title: "Audit failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const extractProjectFromDescription = (description: string) => {
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
      budget = budgetMatch[0].toLowerCase().includes("m")
        ? amount * 1_000_000
        : amount
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === "user"

    return (
      <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex max-w-[80%] items-start gap-3 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
              isUser
                ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
            }`}
          >
            {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
          </div>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "border border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
                : message.type === "audit_result"
                  ? "border border-indigo-200 bg-gradient-to-r from-indigo-50 to-cyan-50 text-zinc-900 dark:border-indigo-400/40 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-zinc-100"
                  : "border border-zinc-900/10 bg-white/85 text-zinc-900 dark:border-white/10 dark:bg-black/20 dark:text-zinc-100"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>

            {message.type === "audit_result" && message.data && (
              <AuditResultDisplay result={message.data as AuditResult} />
            )}

            {message.type === "configuration" && message.data && (
              <ConfigurationDisplay config={message.data as AuditConfig} />
            )}
          </div>
        </div>
      </div>
    )
  }

  const AuditResultDisplay = ({ result }: { result: AuditResult }) => (
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
          <strong>Financial:</strong> Score {result.roi_analysis.profitability_score.toFixed(1)}/100
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
    </div>
  )

  const ConfigurationDisplay = ({ config }: { config: AuditConfig }) => (
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
      {config.focus_areas.length > 0 && (
        <p>
          <strong>Focus Areas:</strong> {config.focus_areas.join(", ")}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Amalin Core</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Conversational multi-agent audit intelligence
          </p>
        </div>
        <Badge className="border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300">
          Enterprise Feature
        </Badge>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="size-5 text-indigo-600" />
            Amalin Intelligence System
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <div
              key={capability.title}
              className="rounded-2xl border border-zinc-900/10 bg-white/85 p-4 dark:border-white/10 dark:bg-black/20"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`size-2.5 rounded-full bg-current ${capability.color}`}
                />
                <p className="text-sm font-medium">{capability.title}</p>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {capability.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="size-5 text-indigo-600" />
            Audit Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 space-y-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isProcessing && (
              <div className="mb-4 flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    <Bot className="size-4" />
                  </div>
                  <div className="rounded-2xl border border-zinc-900/10 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">
                        Processing audit...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-zinc-200 p-4 dark:border-white/10">
            <div className="flex gap-2">
              <Input
                placeholder="Describe a project to audit or ask for help..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                size="icon"
              >
                <Send className="size-4" />
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {conversationStarters.slice(0, 3).map((starter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(starter)}
                  disabled={isProcessing}
                  className="border-zinc-900/10 bg-white/80 text-xs dark:border-white/10 dark:bg-black/20"
                >
                  {starter.length > 30 ? `${starter.substring(0, 30)}...` : starter}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
