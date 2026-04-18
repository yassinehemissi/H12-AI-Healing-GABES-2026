export type SeverityLevel = "low" | "moderate" | "high" | "critical"

export type TimeRangeOption = "24h" | "7d" | "30d"

export type LayerVisibility = {
  sensors: boolean
  heatmap: boolean
  industrialZones: boolean
  coastalZones: boolean
  emissionFlows: boolean
}

export type PollutantIndicators = {
  pm25: number
  no2: number
  so2: number
  nh3: number
}

export type SensorFeature = {
  id: string
  kind: "sensor"
  name: string
  sourceType: "air-station" | "industrial-node" | "mobile-probe"
  severity: SeverityLevel
  aqi: number
  position: [number, number]
  pollutant: PollutantIndicators
  auditSummary: string
  recommendedAction: string
  lastUpdated: string
}

export type ZoneFeature = {
  id: string
  kind: "industrial-zone" | "coastal-zone"
  name: string
  severity: SeverityLevel
  polygon: [number, number][]
  pollutant: PollutantIndicators
  auditSummary: string
  recommendedAction: string
  lastUpdated: string
}

export type EmissionFlowFeature = {
  id: string
  kind: "emission-flow"
  name: string
  severity: SeverityLevel
  path: [number, number][]
  pollutant: PollutantIndicators
  auditSummary: string
  recommendedAction: string
  lastUpdated: string
}

export type MapFeature = SensorFeature | ZoneFeature | EmissionFlowFeature

export type HoverInfoState = {
  x: number
  y: number
  feature: MapFeature
} | null

export type SeverityFilterOption = "all" | SeverityLevel

export type InspectionPanelData = {
  isOpen: boolean
  feature: MapFeature | null
}
