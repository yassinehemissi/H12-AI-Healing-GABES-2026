export type RecyclingIdea = {
  id: string;
  title: string;
  description: string;
  difficulty: "facile" | "moyen" | "difficile";
  materials_used: string[];
  estimated_time: string;
  category: string;
};

export type GeneratedImage = {
  id: string;
  url: string;
  variant_name: string;
  prompt_used: string;
};

export type RecyclingResponse = {
  waste_category: string;
  waste_details: string;
  recycling_instructions: string[];
  disposal_method: string;
  environmental_impact: string;
  sustainable_alternatives: string[];
  eco_tip: string;
  detected_materials: string[];
  reusable_parts: string[];
  object_condition: string;
  is_reusable: boolean;
  safety_flags: string[];
  upcycling_eligible: boolean;
  upcycling_block_reason?: string | null;
  upcycling_materials?: string | null;
  upcycling_session_id?: string | null;
  upcycling_ideas: RecyclingIdea[];
};

export type OrchestratorResponse =
  | { agent: "recycling"; response: RecyclingResponse }
  | { agent: "transparency"; response: TransparencyAnalyzeResponse };

export type RecyclingCategory = {
  id: string;
  label: string;
  emoji: string;
  bin_color: string;
};

export type RecyclingCategoriesResponse = {
  categories: RecyclingCategory[];
};

export type TransparencyUserProfile = {
  age_group: string;
  vulnerabilities: string[];
};

export type PollutantDetails = {
  value: number;
  unit: string;
  status: string;
  seuil_OMS: number;
};

export type TransparencyAnalyzeRequest = {
  location: string;
  date?: string | null;
  user_profile: TransparencyUserProfile;
};

export type TransparencyAnalyzeResponse = {
  location: string;
  date: string;
  alert_level: string;
  alert_message: string;
  aqi_score: number;
  pollution_summary: Record<string, PollutantDetails>;
  anomalies: string[];
  citizen_reports_count: number;
  health_recommendations: string[];
  citizen_reports_summary: string;
  hotzone_clusters: Array<Record<string, unknown>>;
  heatmap_geojson: Record<string, unknown>;
};

export type TransparencyReportRequest = {
  location: string;
  type: string;
  description: string;
  severity: string;
};

export type TransparencyReportResponse = {
  report_id: string;
  status: string;
  message: string;
  timestamp: string;
};

export type TransparencyDashboardResponse = {
  location: string;
  last_updated: string;
  current_alert_level: string;
  trend_7days: string;
  recent_data: Array<Record<string, unknown>>;
  total_citizen_reports: number;
};

export type ManualIdeasResponse = {
  session_id: string;
  ideas: RecyclingIdea[];
};
