"use client"

import { useMemo, useState } from "react"

import type {
  LayerVisibility,
  SeverityFilterOption,
  TimeRangeOption,
} from "@/components/maps/gabes-map-types"
import {
  coastalZoneFeatures,
  emissionFlowFeatures,
  industrialZoneFeatures,
  sensorFeatures,
} from "@/components/maps/gabes-map-data"

const defaultLayerVisibility: LayerVisibility = {
  sensors: true,
  heatmap: true,
  industrialZones: true,
  coastalZones: true,
  emissionFlows: true,
}

const timeRangeHours: Record<TimeRangeOption, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
}

function isWithinTimeRange(isoDate: string, range: TimeRangeOption) {
  const now = Date.now()
  const date = new Date(isoDate).getTime()
  return now - date <= timeRangeHours[range] * 60 * 60 * 1000
}

export function useGabesMapFilters() {
  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibility>(defaultLayerVisibility)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>("24h")
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilterOption>("all")

  const filteredSensors = useMemo(() => {
    return sensorFeatures.filter((item) => {
      const severityPass =
        severityFilter === "all" ? true : item.severity === severityFilter
      return severityPass && isWithinTimeRange(item.lastUpdated, timeRange)
    })
  }, [severityFilter, timeRange])

  const filteredIndustrialZones = useMemo(() => {
    return industrialZoneFeatures.filter((item) => {
      const severityPass =
        severityFilter === "all" ? true : item.severity === severityFilter
      return severityPass && isWithinTimeRange(item.lastUpdated, timeRange)
    })
  }, [severityFilter, timeRange])

  const filteredCoastalZones = useMemo(() => {
    return coastalZoneFeatures.filter((item) => {
      const severityPass =
        severityFilter === "all" ? true : item.severity === severityFilter
      return severityPass && isWithinTimeRange(item.lastUpdated, timeRange)
    })
  }, [severityFilter, timeRange])

  const filteredEmissionFlows = useMemo(() => {
    return emissionFlowFeatures.filter((item) => {
      const severityPass =
        severityFilter === "all" ? true : item.severity === severityFilter
      return severityPass && isWithinTimeRange(item.lastUpdated, timeRange)
    })
  }, [severityFilter, timeRange])

  return {
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
  }
}
