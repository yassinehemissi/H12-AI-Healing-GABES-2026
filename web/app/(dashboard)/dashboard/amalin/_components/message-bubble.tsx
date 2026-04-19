import { Bot, User } from "lucide-react"

import { AuditResultDisplay } from "./audit-result-display"
import { ConfigurationDisplay } from "./configuration-display"
import type { AuditConfig, AuditResult, Message } from "../types"

type MessageBubbleProps = {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
          }`}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "border border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
              : message.type === "audit_result"
                ? "border border-zinc-900/10 bg-white/85 text-zinc-900 dark:border-white/10 dark:bg-black/20 dark:text-zinc-100"
                : "border border-zinc-900/10 bg-white/85 text-zinc-900 dark:border-white/10 dark:bg-black/20 dark:text-zinc-100"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>

          {message.type === "audit_result" && message.data ? (
            <AuditResultDisplay result={message.data as AuditResult} />
          ) : null}
          {message.type === "configuration" && message.data ? (
            <ConfigurationDisplay config={message.data as AuditConfig} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
