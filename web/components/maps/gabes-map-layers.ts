import { HeatmapLayer } from "@deck.gl/aggregation-layers"
import { PathLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers"
import { COORDINATE_SYSTEM } from "@deck.gl/core"

import type {
  EmissionFlowFeature,
  MapFeature,
  SensorFeature,
  ZoneFeature,
} from "@/components/maps/gabes-map-types"

const severityColorScale: Record<
  MapFeature["severity"],
  [number, number, number, number]
> = {
  low: [56, 189, 120, 190],
  moderate: [250, 204, 21, 200],
  high: [251, 146, 60, 210],
  critical: [244, 63, 94, 230],
}

type BuildMapLayersOptions = {
  sensors: SensorFeature[]
  industrialZones: ZoneFeature[]
  coastalZones: ZoneFeature[]
  emissionFlows: EmissionFlowFeature[]
  visibility: {
    sensors: boolean
    heatmap: boolean
    industrialZones: boolean
    coastalZones: boolean
    emissionFlows: boolean
  }
}

export function buildMapLayers({
  sensors,
  industrialZones,
  coastalZones,
  emissionFlows,
  visibility,
}: BuildMapLayersOptions) {
  const layers = []

  if (visibility.heatmap) {
    layers.push(
      new HeatmapLayer<SensorFeature>({
        id: "gabes-pm25-heatmap-layer",
        data: sensors,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPosition: (d) => d.position,
        getWeight: (d) => d.pollutant.pm25,
        radiusPixels: 70,
        intensity: 1.3,
        threshold: 0.06,
      })
    )
  }

  if (visibility.industrialZones) {
    layers.push(
      new PolygonLayer<ZoneFeature>({
        id: "gabes-industrial-zone-layer",
        data: industrialZones,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPolygon: (d) => d.polygon,
        getFillColor: (d) => {
          const [r, g, b] = severityColorScale[d.severity]
          return [r, g, b, 65]
        },
        getLineColor: (d) => {
          const [r, g, b] = severityColorScale[d.severity]
          return [r, g, b, 220]
        },
        lineWidthMinPixels: 2,
        pickable: true,
        autoHighlight: true,
      })
    )
  }

  if (visibility.coastalZones) {
    layers.push(
      new PolygonLayer<ZoneFeature>({
        id: "gabes-coastal-zone-layer",
        data: coastalZones,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPolygon: (d) => d.polygon,
        getFillColor: (d) => {
          const [r, g, b] = severityColorScale[d.severity]
          return [r * 0.85, g * 0.9, Math.min(255, b + 20), 55]
        },
        getLineColor: (d) => {
          const [r, g, b] = severityColorScale[d.severity]
          return [r * 0.85, g * 0.9, Math.min(255, b + 20), 200]
        },
        lineWidthMinPixels: 2,
        pickable: true,
        autoHighlight: true,
      })
    )
  }

  if (visibility.emissionFlows) {
    layers.push(
      new PathLayer<EmissionFlowFeature>({
        id: "gabes-emission-flow-layer",
        data: emissionFlows,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPath: (d) => d.path,
        getColor: (d) => severityColorScale[d.severity],
        widthScale: 2,
        widthMinPixels: 2,
        widthMaxPixels: 6,
        getWidth: (d) => (d.severity === "critical" ? 3 : d.severity === "high" ? 2.4 : 1.8),
        pickable: true,
        autoHighlight: true,
      })
    )
  }

  if (visibility.sensors) {
    layers.push(
      new ScatterplotLayer<SensorFeature>({
        id: "gabes-air-sensor-layer",
        data: sensors,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPosition: (d) => d.position,
        getFillColor: (d) => severityColorScale[d.severity],
        getRadius: (d) => {
          if (d.severity === "critical") return 480
          if (d.severity === "high") return 420
          if (d.severity === "moderate") return 340
          return 280
        },
        radiusMinPixels: 6,
        radiusMaxPixels: 20,
        stroked: true,
        lineWidthMinPixels: 2,
        getLineColor: [255, 255, 255, 210],
        pickable: true,
        autoHighlight: true,
      })
    )
  }

  return layers
}
