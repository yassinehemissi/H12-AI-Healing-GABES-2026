// lib/api.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface DashboardSummary {
  total_companies: number;
  avg_rse_score: number;
  avg_grade: string;
  pollution_trend: string;
  pollution_change_pct: number;
  top_pollutants: { name: string; value: number; unit: string }[];
  recent_news_count: number;
  data_sources: number;
  last_scraping_run: string | null;
}

export interface PollutionTrendPoint {
  month: string;
  so2: number;
  phosphogypsum: number;
  heavy_metals: number;
  wastewater: number;
}

export interface CompanyRanking {
  name: string;
  sector: string;
  location: string;
  description: string;
  employee_count: number | null;
  founded_year: number | null;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_score: number;
  grade: string;
  last_assessed: string;
}

export interface NewsItem {
  title: string;
  url: string;
  published: string;
}

export interface Recommendation {
  category: string;
  priority: string;
  title: string;
  description: string;
  impact_score: number;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getDashboard(): Promise<DashboardSummary> {
  return fetchAPI<DashboardSummary>("/analysis/dashboard");
}

export async function getPollutionTrends(): Promise<PollutionTrendPoint[]> {
  return fetchAPI<PollutionTrendPoint[]>("/analysis/pollution-trends");
}

export async function getCompanies(): Promise<CompanyRanking[]> {
  return fetchAPI<CompanyRanking[]>("/analysis/companies");
}

export async function getNews(): Promise<NewsItem[]> {
  return fetchAPI<NewsItem[]>("/analysis/news");
}

export async function getRecommendations(company: string): Promise<Recommendation[]> {
  return fetchAPI<Recommendation[]>(`/analysis/recommendations/${encodeURIComponent(company)}`);
}
