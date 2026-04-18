"use client"

import "maplibre-gl/dist/maplibre-gl.css"

import { useEffect, useMemo, useState } from "react"
import type { PickingInfo } from "@deck.gl/core"
import { MapboxOverlay } from "@deck.gl/mapbox"
import type { Layer } from "@deck.gl/core"
import Map, { useControl } from "react-map-gl/maplibre"
import {
  AlertTriangle,
  Clock3,
  Factory,
  Filter,
  Layers2,
  Radio,
  Waves,
} from "lucide-react"

import { buildMapLayers } from "@/components/maps/gabes-map-layers"
import { GABES_BOUNDS, GABES_MAP_CENTER } from "@/components/maps/gabes-map-data"
import { GabesInspectionSheet } from "@/components/maps/gabes-inspection-sheet"
import { GabesMapLegend } from "@/components/maps/gabes-map-legend"
import type {
  HoverInfoState,
  LayerVisibility,
  MapFeature,
  SeverityFilterOption,
  TimeRangeOption,
} from "@/components/maps/gabes-map-types"
import { useGabesMapFilters } from "@/components/maps/use-gabes-map-filters"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type GabesEnvironmentalMapProps = {
  className?: string
  initialCenter?: [number, number]
  initialZoom?: number
}

const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
const lightStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

function DeckGLMapOverlay(props: {
  layers: Layer[]
  onHover: (info: PickingInfo<MapFeature>) => void
  onClick: (info: PickingInfo<MapFeature>) => void
}) {
  const overlay = useControl<MapboxOverlay>(() => {
    return new MapboxOverlay({
      interleaved: true,
      layers: props.layers,
      onHover: props.onHover,
      onClick: props.onClick,
    })
  })

  overlay.setProps({
    layers: props.layers,
    onHover: props.onHover,
    onClick: props.onClick,
  })

  return null
}

function useThemeAwareMapStyle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const update = () => setIsDark(html.classList.contains("dark"))
    update()

    const observer = new MutationObserver(update)
    observer.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return isDark ? darkStyle : lightStyle
}

function severityLabel(severity: SeverityFilterOption) {
  if (severity === "all") return "All severities"
  return severity[0].toUpperCase() + severity.slice(1)
}

function HoverTooltip({ hoverInfo }: { hoverInfo: HoverInfoState }) {
  if (!hoverInfo) return null
  const { x, y, feature } = hoverInfo

  return (
    <div
      className="pointer-events-none absolute z-30 max-w-[260px] rounded-2xl border border-zinc-900/10 bg-white/95 p-2.5 text-xs shadow-lg dark:border-white/10 dark:bg-[#0d1118]/95"
      style={{ left: x + 14, top: y + 14 }}
    >
      <p className="font-medium">{feature.name}</p>
      <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{feature.kind}</p>
      <p className="mt-1 text-zinc-600 dark:text-zinc-300">
        PM2.5 {feature.pollutant.pm25} • NO2 {feature.pollutant.no2}
      </p>
    </div>
  )
}

function LayerToggles({
  visibility,
  onToggle,
}: {
  visibility: LayerVisibility
  onToggle: (key: keyof LayerVisibility, value: boolean) => void
}) {
  return (
    <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers2 className="size-4" />
          Layer Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[
          { key: "sensors", label: "Air sensors", icon: Radio },
          { key: "heatmap", label: "PM2.5 heatmap", icon: AlertTriangle },
          { key: "industrialZones", label: "Industrial zones", icon: Factory },
          { key: "coastalZones", label: "Coastal overlay", icon: Waves },
          { key: "emissionFlows", label: "Emission flow", icon: Layers2 },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-xl border border-zinc-900/10 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="flex items-center gap-2 text-xs">
              <item.icon className="size-3.5" />
              {item.label}
            </p>
            <Switch
              size="sm"
              checked={visibility[item.key as keyof LayerVisibility]}
              onCheckedChange={(value) =>
                onToggle(item.key as keyof LayerVisibility, value)
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function GabesEnvironmentalMap({
  className,
  initialCenter = GABES_MAP_CENTER,
  initialZoom = 10.9,
}: GabesEnvironmentalMapProps) {
  const mapStyle = useThemeAwareMapStyle()

  const {
    layerVisibility,
    setLayerVisibility,
    timeRange,
    setTimeRange,
    severityFilter,
    setSeverityFilter,
    filteredSensors,
    filteredIndustrialZones,
    filteredCoastalZones,
    filteredEmissionFlows,
  } = useGabesMapFilters()

  const [hoverInfo, setHoverInfo] = useState<HoverInfoState>(null)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const layers = useMemo(() => {
    return buildMapLayers({
      sensors: filteredSensors,
      industrialZones: filteredIndustrialZones,
      coastalZones: filteredCoastalZones,
      emissionFlows: filteredEmissionFlows,
      visibility: layerVisibility,
    })
  }, [
    filteredSensors,
    filteredIndustrialZones,
    filteredCoastalZones,
    filteredEmissionFlows,
    layerVisibility,
  ])

  const kpis = useMemo(() => {
    const zoneCount = filteredIndustrialZones.length + filteredCoastalZones.length
    const activeAlerts = [
      ...filteredSensors,
      ...filteredIndustrialZones,
      ...filteredCoastalZones,
    ].filter((item) => item.severity === "high" || item.severity === "critical").length

    const avgAqi =
      filteredSensors.length > 0
        ? Math.round(
            filteredSensors.reduce((sum, item) => sum + item.aqi, 0) /
              filteredSensors.length
          )
        : 0

    const criticalZones = [...filteredIndustrialZones, ...filteredCoastalZones].filter(
      (item) => item.severity === "critical"
    ).length

    return {
      activeAlerts,
      monitoredSources: filteredSensors.length + zoneCount,
      avgAqi,
      criticalZones,
    }
  }, [filteredSensors, filteredIndustrialZones, filteredCoastalZones])

  const handleHover = (info: PickingInfo<MapFeature>) => {
    if (!info.object || typeof info.x !== "number" || typeof info.y !== "number") {
      setHoverInfo(null)
      return
    }
    setHoverInfo({
      x: info.x,
      y: info.y,
      feature: info.object,
    })
  }

  const handleClick = (info: PickingInfo<MapFeature>) => {
    if (!info.object) return
    setSelectedFeature(info.object)
    setSheetOpen(true)
  }

  return (
    <section className={className}>
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
              <CardContent className="pt-5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Active alerts</p>
                <p className="mt-1 text-2xl font-semibold">{kpis.activeAlerts}</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
              <CardContent className="pt-5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Monitored sources</p>
                <p className="mt-1 text-2xl font-semibold">{kpis.monitoredSources}</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
              <CardContent className="pt-5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg AQI</p>
                <p className="mt-1 text-2xl font-semibold">{kpis.avgAqi}</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
              <CardContent className="pt-5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Critical zones</p>
                <p className="mt-1 text-2xl font-semibold">{kpis.criticalZones}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gabès Environmental Intelligence Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[620px] overflow-hidden rounded-3xl border border-zinc-900/10 dark:border-white/10">
                <Map
                  reuseMaps
                  initialViewState={{
                    longitude: initialCenter[0],
                    latitude: initialCenter[1],
                    zoom: initialZoom,
                    pitch: 35,
                    bearing: -8,
                  }}
                  maxZoom={14}
                  minZoom={9.8}
                  maxBounds={GABES_BOUNDS}
                  attributionControl={false}
                  mapStyle={mapStyle}
                >
                  <DeckGLMapOverlay
                    layers={layers}
                    onHover={handleHover}
                    onClick={handleClick}
                  />
                </Map>

                <HoverTooltip hoverInfo={hoverInfo} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="size-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="overview">
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-zinc-100 p-1 dark:bg-white/[0.05]">
                  <TabsTrigger value="overview" className="rounded-xl">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-xl">
                    Advanced
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Time range</p>
                    <Select
                      value={timeRange}
                      onValueChange={(value) => setTimeRange(value as TimeRangeOption)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Severity</p>
                    <Select
                      value={severityFilter}
                      onValueChange={(value) =>
                        setSeverityFilter(value as SeverityFilterOption)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="w-full justify-center py-1.5">
                          {severityLabel(severityFilter)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Filtering applies to sensors, zones, and flows.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsContent>
                <TabsContent value="advanced" className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                  Advanced mode can include anomaly thresholds and model confidence controls.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <LayerToggles
            visibility={layerVisibility}
            onToggle={(key, value) =>
              setLayerVisibility((prev) => ({
                ...prev,
                [key]: value,
              }))
            }
          />

          <GabesMapLegend />

          <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm">Last signal update</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-600 dark:text-zinc-300">
              <p className="flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                Data refreshed from local mocked intelligence feed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <GabesInspectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        feature={selectedFeature}
      />
    </section>
  )
}
