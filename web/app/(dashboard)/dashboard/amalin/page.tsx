"use client"

import { useEffect, useState } from "react"
import { Bot, Loader2, Send } from "lucide-react"

import { conversationStarters, defaultAuditConfig } from "./amalin.constants"
import { AuditRunCard } from "./_components/audit-run-card"
import type {
  AuditListResponse,
  AuditResult,
  StoredAuditCard,
  StreamEventPayload,
} from "./types"
import { extractProjectFromDescription, getApiBaseUrl } from "./utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function AmalinCorePage() {
  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState("Idle")
  const [streamUpdates, setStreamUpdates] = useState<string[]>([])
  const [audits, setAudits] = useState<StoredAuditCard[]>([])
  const [isLoadingAudits, setIsLoadingAudits] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    void loadAudits(1, true)
  }, [])

  const loadAudits = async (targetPage: number, reset = false) => {
    if (reset) {
      setIsLoadingAudits(true)
    } else {
      setIsLoadingMore(true)
    }
    try {
      const response = await fetch(`/api/amalin/audits?page=${targetPage}&limit=10`, {
        method: "GET",
      })
      if (!response.ok) {
        throw new Error(`Failed to load audits: ${response.statusText}`)
      }
      const payload = (await response.json()) as AuditListResponse
      const fetchedAudits = payload.audits || []
      setAudits((prev) => (reset ? fetchedAudits : [...prev, ...fetchedAudits]))
      setPage(payload.pagination?.page || targetPage)
      setHasMore(Boolean(payload.pagination?.hasMore))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Failed to fetch audits",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingAudits(false)
      setIsLoadingMore(false)
    }
  }

  const saveAudit = async (inputPrompt: string, result: AuditResult) => {
    const response = await fetch("/api/amalin/audits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputPrompt,
        analysisDepth: defaultAuditConfig.analysis_depth,
        result,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.error || `Failed to save audit: ${response.statusText}`)
    }

    const payload = (await response.json()) as { audit: StoredAuditCard }
    setAudits((prev) => [payload.audit, ...prev])
  }

  const handleRunAudit = async () => {
    if (!prompt.trim() || isProcessing) {
      return
    }

    const userPrompt = prompt.trim()
    setPrompt("")
    setIsProcessing(true)
    setCurrentStep("Preparing request...")
    setStreamUpdates([])

    const apiBaseUrl = getApiBaseUrl()

    try {
      const projectData = extractProjectFromDescription(userPrompt)

      const requestData = {
        project: projectData,
        analysis_depth: defaultAuditConfig.analysis_depth,
        inquiry: userPrompt,
        conversation: [],
      }

      const response = await fetch(`${apiBaseUrl}/audit/stream`, {
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

      if (!response.body) {
        throw new Error("Streaming response body is empty")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finalResult: AuditResult | null = null

      const pushUpdate = (line: string) => {
        setStreamUpdates((prev) => [...prev.slice(-7), line])
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split("\n\n")
        buffer = frames.pop() ?? ""

        for (const frame of frames) {
          if (!frame.trim()) continue

          const lines = frame.split("\n")
          let eventType = "message"
          const dataLines: string[] = []

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim()
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim())
            }
          }

          const dataString = dataLines.join("\n")
          if (!dataString) continue

          let payload: StreamEventPayload
          try {
            payload = JSON.parse(dataString) as StreamEventPayload
          } catch {
            continue
          }

          if (eventType === "node_started") {
            const label = payload.label || payload.node || "Running node..."
            setCurrentStep(label)
            pushUpdate(label)
          } else if (eventType === "node_completed") {
            const label = payload.label || `${payload.node || "Node"} complete`
            setCurrentStep(label)
            pushUpdate(label)
          } else if (eventType === "final_summary") {
            setCurrentStep("Finalizing response")
            finalResult = payload.result ?? null
          } else if (eventType === "error") {
            throw new Error(payload.detail || "Streaming audit failed")
          }
        }
      }

      if (!finalResult) {
        throw new Error("Audit stream completed without final summary payload")
      }

      await saveAudit(userPrompt, finalResult)
      setPage(1)
      setHasMore(true)

      toast({
        title: "Audit completed",
        description: `Saved card for ${finalResult.project_name}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Audit failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setCurrentStep("Idle")
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void handleRunAudit()
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[620px] flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Amalin Core</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Card-based multi-agent audit intelligence
          </p>
        </div>
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300">
          Enterprise Feature
        </Badge>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-[#0d1118]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="size-5 text-emerald-600" />
            Run Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Describe a project to audit..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button onClick={handleRunAudit} disabled={!prompt.trim() || isProcessing} size="icon">
              <Send className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {conversationStarters.slice(0, 4).map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(starter)}
                disabled={isProcessing}
                className="border-zinc-900/10 bg-white/80 text-xs dark:border-white/10 dark:bg-black/20"
              >
                {starter.length > 45 ? `${starter.substring(0, 45)}...` : starter}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isProcessing ? (
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-[#0d1118]">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Loader2 className="size-4 animate-spin" />
              <span>{currentStep}</span>
            </div>
            {streamUpdates.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {streamUpdates.map((update, index) => (
                  <li key={`${index}-${update.slice(0, 24)}`}>- {update}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isLoadingAudits ? (
          <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-[#0d1118]">
            <CardContent className="pt-5 text-sm text-zinc-600 dark:text-zinc-300">
              Loading saved audit cards...
            </CardContent>
          </Card>
        ) : audits.length === 0 ? (
          <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-[#0d1118]">
            <CardContent className="pt-5 text-sm text-zinc-600 dark:text-zinc-300">
              No saved audits yet. Run an audit to generate your first card.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => (
              <AuditRunCard key={audit.id} audit={audit} />
            ))}
            {hasMore ? (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadAudits(page + 1, false)}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
