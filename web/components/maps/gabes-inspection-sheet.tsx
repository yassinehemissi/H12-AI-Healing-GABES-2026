"use client"

import { AlertTriangle, Clock3, FileSearch, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { MapFeature } from "@/components/maps/gabes-map-types"

type GabesInspectionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: MapFeature | null
}

const severityClassMap: Record<MapFeature["severity"], string> = {
  low: "border-emerald-300/30 bg-emerald-300/15 text-emerald-700 dark:text-emerald-200",
  moderate: "border-amber-300/30 bg-amber-300/15 text-amber-700 dark:text-amber-200",
  high: "border-orange-300/30 bg-orange-300/15 text-orange-700 dark:text-orange-200",
  critical: "border-rose-300/30 bg-rose-300/15 text-rose-700 dark:text-rose-200",
}

function featureTypeLabel(feature: MapFeature) {
  if (feature.kind === "sensor") return "Air quality sensor"
  if (feature.kind === "industrial-zone") return "Industrial zone"
  if (feature.kind === "coastal-zone") return "Coastal pollution zone"
  return "Emission flow path"
}

export function GabesInspectionSheet({
  open,
  onOpenChange,
  feature,
}: GabesInspectionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-l border-zinc-900/10 bg-white/95 p-0 text-zinc-900 sm:max-w-md dark:border-white/10 dark:bg-[#0d1118] dark:text-zinc-100">
        <SheetHeader className="space-y-2 border-b border-zinc-900/10 px-5 pb-4 pt-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-lg">Inspection Panel</SheetTitle>
            {feature ? (
              <Badge className={severityClassMap[feature.severity]}>
                {feature.severity}
              </Badge>
            ) : null}
          </div>
          <SheetDescription>
            Detailed audit and recommended response for selected intelligence object.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 py-4">
          {!feature ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Select a sensor, zone, or flow on the map to inspect details.
            </p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Source
                </p>
                <p className="mt-1 text-base font-medium">{feature.name}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {featureTypeLabel(feature)}
                </p>
              </div>

              <Separator className="bg-zinc-900/10 dark:bg-white/10" />

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  <ShieldAlert className="size-3.5" />
                  Pollutant indicators
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="rounded-xl border border-zinc-900/10 bg-white/75 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                    PM2.5: <strong>{feature.pollutant.pm25}</strong>
                  </p>
                  <p className="rounded-xl border border-zinc-900/10 bg-white/75 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                    NO2: <strong>{feature.pollutant.no2}</strong>
                  </p>
                  <p className="rounded-xl border border-zinc-900/10 bg-white/75 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                    SO2: <strong>{feature.pollutant.so2}</strong>
                  </p>
                  <p className="rounded-xl border border-zinc-900/10 bg-white/75 px-2 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                    NH3: <strong>{feature.pollutant.nh3}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  <FileSearch className="size-3.5" />
                  Audit summary
                </p>
                <p className="rounded-2xl border border-zinc-900/10 bg-white/80 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                  {feature.auditSummary}
                </p>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  <AlertTriangle className="size-3.5" />
                  Recommended action
                </p>
                <p className="rounded-2xl border border-zinc-900/10 bg-white/80 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                  {feature.recommendedAction}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-900/10 bg-white/80 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]">
                <p className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  Last updated
                </p>
                <p className="font-medium">
                  {new Date(feature.lastUpdated).toLocaleString()}
                </p>
              </div>

              <Button className="w-full">Create inspection task</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
