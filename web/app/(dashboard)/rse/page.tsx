"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const PollutionChart = dynamic(() => import("../components/pollution-chart"), { ssr: false, loading: () => <div style={{ height: 300 }} /> });
const TopPollutants = dynamic(() => import("../components/top-pollutants"), { ssr: false, loading: () => <div style={{ height: 300 }} /> });
const CompanyRadar = dynamic(() => import("../components/company-radar"), { ssr: false, loading: () => <div style={{ height: 250 }} /> });

interface DashboardData {
  total_companies: number;
  avg_rse_score: number;
  avg_grade: string;
  pollution_trend: string;
  pollution_change_pct: number;
  top_pollutants: { name: string; value: number; unit: string }[];
  recent_news_count: number;
  data_sources: number;
}
interface PollutionPoint { month: string; so2: number; phosphogypsum: number; heavy_metals: number; wastewater: number; }
interface Company { name: string; sector: string; location: string; description: string; employee_count: number | null; environmental_score: number; social_score: number; governance_score: number; overall_score: number; grade: string; }
interface NewsItem { title: string; url: string; published: string; }
interface Recommendation { category: string; priority: string; title: string; description: string; impact_score: number; }

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const gradeColors: Record<string, string> = { A: "#22c55e", B: "#84cc16", C: "#eab308", D: "#f97316", E: "#ef4444", F: "#dc2626" };
const gradeGlow: Record<string, string> = { A: "0 0 20px rgba(34,197,94,0.4)", B: "0 0 20px rgba(132,204,22,0.3)", C: "0 0 20px rgba(234,179,8,0.3)", D: "0 0 20px rgba(249,115,22,0.3)", E: "0 0 20px rgba(239,68,68,0.3)", F: "0 0 20px rgba(220,38,38,0.4)" };

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pollution, setPollution] = useState<PollutionPoint[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [d, p, c, n] = await Promise.all([
          fetch(`${API}/analysis/dashboard`).then((r) => r.json()),
          fetch(`${API}/analysis/pollution-trends`).then((r) => r.json()),
          fetch(`${API}/analysis/companies`).then((r) => r.json()),
          fetch(`${API}/analysis/news`).then((r) => r.json()),
        ]);
        setDashboard(d); setPollution(p); setCompanies(c); setNews(n);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function loadRecommendations(company: Company) {
    setSelectedCompany(company);
    setRecsLoading(true);
    try {
      const res = await fetch(`${API}/analysis/recommendations/${encodeURIComponent(company.name)}`);
      if (!res.ok) { setRecommendations([]); return; }
      const data = await res.json();
      const recs = Array.isArray(data) ? data : Array.isArray((data as any)?.recommendations) ? (data as any).recommendations : [];
      setRecommendations(recs);
    } catch { setRecommendations([]); } finally { setRecsLoading(false); }
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /><p className="loading-text">Loading AI Healing Dashboard...</p></div>;
  if (error) return <div className="loading-screen"><div className="error-icon">⚠️</div><p className="loading-text">Connection Error</p><p className="error-sub">{error}</p></div>;

  const trendIcon = dashboard?.pollution_trend === "improving" ? "↓" : dashboard?.pollution_trend === "worsening" ? "↑" : "→";
  const trendColor = dashboard?.pollution_trend === "improving" ? "#22c55e" : dashboard?.pollution_trend === "worsening" ? "#ef4444" : "#eab308";

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="header-left">
          <div className="logo-group">
            <div className="logo-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16" stroke="url(#lg)" strokeWidth="2.5" />
                <path d="M18 8 C12 14, 10 20, 18 28 C26 20, 24 14, 18 8Z" fill="url(#lg)" opacity="0.8" />
                <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#34d399" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
              </svg>
            </div>
            <div>
              <h1 className="header-title">AI Healing Gabès</h1>
              <p className="header-sub">Environmental RSE Broker • Industrial Zone Analytics</p>
            </div>
          </div>
        </div>
        <nav className="header-right" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/rse" style={{ color: "#34d399", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>Dashboard</Link>
          <Link href="/analytics" style={{ color: "#94a3b8", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>AI Analytics</Link>
          <div className="status-badge"><span className="status-dot" /><span>Live Data</span></div>
        </nav>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div className="kpi-content"><span className="kpi-value">{dashboard?.total_companies}</span><span className="kpi-label">Companies Monitored</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><div className="kpi-content"><span className="kpi-value">{dashboard?.avg_rse_score}<span className="grade-badge-sm" style={{ backgroundColor: gradeColors[dashboard?.avg_grade || "D"], boxShadow: gradeGlow[dashboard?.avg_grade || "D"] }}>{dashboard?.avg_grade}</span></span><span className="kpi-label">Avg RSE Score</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: `${trendColor}22`, color: trendColor }}><span style={{ fontSize: "24px", fontWeight: 700 }}>{trendIcon}</span></div><div className="kpi-content"><span className="kpi-value" style={{ color: trendColor }}>{Math.abs(dashboard?.pollution_change_pct || 0)}%</span><span className="kpi-label">Pollution {dashboard?.pollution_trend}</span></div></div>
        <div className="kpi-card"><div className="kpi-icon" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div className="kpi-content"><span className="kpi-value">{dashboard?.data_sources}</span><span className="kpi-label">Active Data Sources</span></div></div>
      </section>

      <section className="charts-row">
        <div className="chart-card wide"><h2 className="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Pollution Trends — 12 Month Overview</h2><div className="chart-wrap"><PollutionChart data={pollution} /></div></div>
        <div className="chart-card narrow"><h2 className="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Current Pollutant Levels</h2><div className="chart-wrap"><TopPollutants data={dashboard?.top_pollutants} /></div></div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>Company RSE Rankings</h2>
          <div className="search-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="text" placeholder="Search companies or sectors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        </div>
        <div className="table-wrap">
          <table className="company-table">
            <thead><tr><th>#</th><th>Company</th><th>Sector</th><th>Env</th><th>Social</th><th>Gov</th><th>Overall</th><th>Grade</th><th>Action</th></tr></thead>
            <tbody>
              {filteredCompanies.map((c, i) => (
                <tr key={c.name} className={selectedCompany?.name === c.name ? "row-active" : ""}>
                  <td className="rank">{i + 1}</td>
                  <td className="company-name">{c.name}</td>
                  <td className="sector">{c.sector}</td>
                  <td><span className="score-cell" style={{ color: c.environmental_score > 50 ? "#22c55e" : "#ef4444" }}>{c.environmental_score}</span></td>
                  <td><span className="score-cell" style={{ color: c.social_score > 50 ? "#22c55e" : "#ef4444" }}>{c.social_score}</span></td>
                  <td><span className="score-cell" style={{ color: c.governance_score > 50 ? "#22c55e" : "#ef4444" }}>{c.governance_score}</span></td>
                  <td><span className="score-cell overall">{c.overall_score}</span></td>
                  <td><span className="grade-badge" style={{ backgroundColor: gradeColors[c.grade] + "22", color: gradeColors[c.grade], borderColor: gradeColors[c.grade] + "44" }}>{c.grade}</span></td>
                  <td><button className="action-btn" onClick={() => loadRecommendations(c)}>Recommendations</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCompany && (
        <section className="section recs-section">
          <div className="recs-header">
            <div>
              <h2 className="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>RSE Recommendations — {selectedCompany.name}</h2>
              <p className="recs-subtitle">Current Grade: <span className="grade-badge-inline" style={{ color: gradeColors[selectedCompany.grade] }}>{selectedCompany.grade}</span>{" • "}Overall Score: {selectedCompany.overall_score}/100</p>
            </div>
            <button className="close-btn" onClick={() => setSelectedCompany(null)}>✕</button>
          </div>
          <div className="recs-body">
            <div className="radar-wrap"><CompanyRadar company={selectedCompany} /></div>
            <div className="recs-list">
              {recsLoading ? <div className="recs-loading">Loading recommendations...</div> : recommendations.length === 0 ? <div className="recs-loading">No recommendations available.</div> : recommendations.map((r, i) => (
                <div key={i} className={`rec-card priority-${r.priority}`}>
                  <div className="rec-header"><span className={`priority-badge ${r.priority}`}>{r.priority}</span><span className="rec-category">{r.category}</span><span className="rec-impact">+{r.impact_score} pts</span></div>
                  <h3 className="rec-title">{r.title}</h3>
                  <p className="rec-desc">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="card-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/></svg>Gabès Environmental News</h2>
        <div className="news-grid">
          {news.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="news-card">
              <div className="news-date">{item.published}</div>
              <h3 className="news-title">{item.title}</h3>
              <span className="news-link">Read more →</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="dash-footer">
        <p>AI Healing Gabès — Synaptech Team • H12 Hackathon by ESPRIT 2026</p>
      </footer>
    </div>
  );
}
