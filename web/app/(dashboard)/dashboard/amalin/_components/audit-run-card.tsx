import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { AuditResultDisplay } from "./audit-result-display"
import type { StoredAuditCard } from "../types"

type AuditRunCardProps = {
  audit: StoredAuditCard
}

export function AuditRunCard({ audit }: AuditRunCardProps) {
  const createdAt = new Date(audit.createdAt)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-[#0d1118]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{audit.prompt}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{createdAt.toLocaleString()}</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              {isOpen ? "Collapse" : "Open"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Depth: {audit.analysisDepth}</span>
          {audit.inquiryIntent ? <span>Intent: {audit.inquiryIntent}</span> : null}
          {audit.consultedAgents && audit.consultedAgents.length > 0 ? (
            <span>Agents: {audit.consultedAgents.join(", ")}</span>
          ) : null}
        </div>
        {isOpen ? (
          <AuditResultDisplay result={audit.result} />
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Card collapsed. Open to view full audit details.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
