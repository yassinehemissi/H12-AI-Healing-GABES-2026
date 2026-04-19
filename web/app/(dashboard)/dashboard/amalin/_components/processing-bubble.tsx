import { Bot, Loader2 } from "lucide-react"

type ProcessingBubbleProps = {
  currentStep: string
  streamUpdates: string[]
}

export function ProcessingBubble({ currentStep, streamUpdates }: ProcessingBubbleProps) {
  return (
    <div className="mb-4 flex justify-start">
      <div className="flex items-start gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <Bot className="size-4" />
        </div>
        <div className="rounded-2xl border border-zinc-900/10 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{currentStep}</span>
          </div>
          {streamUpdates.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {streamUpdates.map((update, index) => (
                <li key={`${index}-${update.slice(0, 24)}`}>- {update}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
