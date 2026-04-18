export type ChartType = "bar" | "line" | "pie" | "area" | "scatter";

export interface ChartVisualization {
  chart_type: ChartType;
  title: string;
  description?: string;
  data_points: Record<string, number | string | null>[];
  x_axis?: string;
  y_axis?: string;
  colors?: string[];
}

export interface AnalyticsResponse {
  success: boolean;
  query_interpretation: string;
  visualizations: ChartVisualization[];
  insights: string;
  summary?: string;
  data_sources?: string[];
  error?: string;
}

export interface AnalyticsQueryRequest {
  user_prompt: string;
}

export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  data: AnalyticsResponse | null;
  lastPrompt: string | null;
}
