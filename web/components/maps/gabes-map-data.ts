import type {
  EmissionFlowFeature,
  SensorFeature,
  ZoneFeature,
} from "@/components/maps/gabes-map-types"

export const GABES_MAP_CENTER: [number, number] = [10.103, 33.8869]

export const GABES_BOUNDS: [[number, number], [number, number]] = [
  [9.95, 33.72],
  [10.32, 34.02],
]

export const sensorFeatures: SensorFeature[] = [
  {
    id: "sensor-mdhila",
    kind: "sensor",
    name: "Mdhila Industrial Sensor",
    sourceType: "industrial-node",
    severity: "critical",
    aqi: 191,
    position: [10.1201, 33.9024],
    pollutant: { pm25: 87, no2: 71, so2: 62, nh3: 49 },
    auditSummary: "Persistent SO2 and PM2.5 exceedance near fertilizer processing corridor.",
    recommendedAction: "Run targeted stack filtration audit and enforce 48h mitigation protocol.",
    lastUpdated: "2026-04-18T15:12:00Z",
  },
  {
    id: "sensor-coast-port",
    kind: "sensor",
    name: "Gabès Port Coastal Station",
    sourceType: "air-station",
    severity: "high",
    aqi: 154,
    position: [10.1436, 33.8832],
    pollutant: { pm25: 62, no2: 54, so2: 45, nh3: 20 },
    auditSummary: "Marine breeze carrying industrial plume inland during peak operating windows.",
    recommendedAction: "Trigger adaptive traffic and shipping emissions control window.",
    lastUpdated: "2026-04-18T14:47:00Z",
  },
  {
    id: "sensor-city-center",
    kind: "sensor",
    name: "City Center Citizen Probe",
    sourceType: "mobile-probe",
    severity: "moderate",
    aqi: 98,
    position: [10.0952, 33.8783],
    pollutant: { pm25: 34, no2: 29, so2: 19, nh3: 8 },
    auditSummary: "Traffic-linked spikes observed in short intervals near civic axis.",
    recommendedAction: "Deploy dynamic clean-route guidance for public commute hours.",
    lastUpdated: "2026-04-18T15:08:00Z",
  },
  {
    id: "sensor-chenini",
    kind: "sensor",
    name: "Chenini Perimeter Node",
    sourceType: "air-station",
    severity: "high",
    aqi: 146,
    position: [10.066, 33.915],
    pollutant: { pm25: 58, no2: 44, so2: 41, nh3: 17 },
    auditSummary: "Northern perimeter indicates sustained particulate transport overnight.",
    recommendedAction: "Increase nocturnal monitoring cadence and expand flow simulation coverage.",
    lastUpdated: "2026-04-18T13:56:00Z",
  },
  {
    id: "sensor-ghannouche",
    kind: "sensor",
    name: "Ghannouche Monitoring Pole",
    sourceType: "air-station",
    severity: "low",
    aqi: 64,
    position: [10.0619, 33.9344],
    pollutant: { pm25: 19, no2: 21, so2: 12, nh3: 6 },
    auditSummary: "Background readings within acceptable thresholds.",
    recommendedAction: "Maintain baseline monitoring and weekly calibration cycle.",
    lastUpdated: "2026-04-18T12:31:00Z",
  },
]

export const industrialZoneFeatures: ZoneFeature[] = [
  {
    id: "zone-gct-complex",
    kind: "industrial-zone",
    name: "GCT Industrial Complex",
    severity: "critical",
    polygon: [
      [10.108, 33.903],
      [10.133, 33.903],
      [10.133, 33.885],
      [10.108, 33.885],
      [10.108, 33.903],
    ],
    pollutant: { pm25: 79, no2: 64, so2: 73, nh3: 56 },
    auditSummary: "Zone flagged for cumulative sulfur and ammonia load above policy envelope.",
    recommendedAction: "Immediate compliance checkpoint and phased emission throttling.",
    lastUpdated: "2026-04-18T15:03:00Z",
  },
  {
    id: "zone-urban-transition",
    kind: "industrial-zone",
    name: "Urban-Industrial Transition Strip",
    severity: "high",
    polygon: [
      [10.082, 33.891],
      [10.109, 33.891],
      [10.109, 33.873],
      [10.082, 33.873],
      [10.082, 33.891],
    ],
    pollutant: { pm25: 55, no2: 48, so2: 39, nh3: 21 },
    auditSummary: "High co-exposure risk due to mixed traffic and industrial plumes.",
    recommendedAction: "Deploy barrier greening and reroute heavy truck windows.",
    lastUpdated: "2026-04-18T14:22:00Z",
  },
]

export const coastalZoneFeatures: ZoneFeature[] = [
  {
    id: "coast-gabes-gulf",
    kind: "coastal-zone",
    name: "Gabès Gulf Coastal Buffer",
    severity: "high",
    polygon: [
      [10.087, 33.874],
      [10.182, 33.874],
      [10.194, 33.843],
      [10.091, 33.843],
      [10.087, 33.874],
    ],
    pollutant: { pm25: 36, no2: 27, so2: 32, nh3: 25 },
    auditSummary: "Coastal belt indicates marine deposition linked with industrial outflow.",
    recommendedAction: "Expand marine sampling transects and strengthen discharge inspection.",
    lastUpdated: "2026-04-18T14:39:00Z",
  },
]

export const emissionFlowFeatures: EmissionFlowFeature[] = [
  {
    id: "flow-industrial-to-urban",
    kind: "emission-flow",
    name: "Industrial plume drift",
    severity: "high",
    path: [
      [10.121, 33.898],
      [10.109, 33.891],
      [10.098, 33.884],
      [10.089, 33.878],
    ],
    pollutant: { pm25: 53, no2: 46, so2: 41, nh3: 29 },
    auditSummary: "Modeled transport path aligns with evening AQI spikes in urban nodes.",
    recommendedAction: "Schedule dynamic mitigation before evening inversion period.",
    lastUpdated: "2026-04-18T15:10:00Z",
  },
  {
    id: "flow-coastal-return",
    kind: "emission-flow",
    name: "Coastal recirculation band",
    severity: "moderate",
    path: [
      [10.149, 33.872],
      [10.132, 33.879],
      [10.117, 33.885],
      [10.104, 33.892],
    ],
    pollutant: { pm25: 32, no2: 24, so2: 26, nh3: 14 },
    auditSummary: "Mid-level recirculation causes pollutant persistence in shoreline sectors.",
    recommendedAction: "Increase nighttime coastal dispersal forecasting cadence.",
    lastUpdated: "2026-04-18T14:58:00Z",
  },
]
