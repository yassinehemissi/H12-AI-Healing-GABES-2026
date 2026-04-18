import { Waves, Factory, Flame, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const severityLegend = [
  { label: "Low", color: "bg-emerald-500" },
  { label: "Moderate", color: "bg-amber-400" },
  { label: "High", color: "bg-orange-500" },
  { label: "Critical", color: "bg-rose-500" },
]

export function GabesMapLegend() {
  return (
    <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-sm">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Severity scale
          </p>
          <div className="grid grid-cols-2 gap-2">
            {severityLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Layers
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="gap-1">
              <Radio className="size-3.5" />
              Sensors
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Factory className="size-3.5" />
              Industrial zones
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Waves className="size-3.5" />
              Coastal overlay
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Flame className="size-3.5" />
              Emission flow
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
