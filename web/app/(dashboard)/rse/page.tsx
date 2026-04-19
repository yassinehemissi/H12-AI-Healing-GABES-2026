"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  Search,
  X,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  Layers,
  BarChart2,
  Globe,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PollutionChart = dynamic(() => import("../components/pollution-chart"), { ssr: false, loading: () => <div className="h-[300px]" /> });
const TopPollutants = dynamic(() => import("../components/top-pollutants"), { ssr: false, loading: () => <div className="h-[300px]" /> });
const CompanyRadar = dynamic(() => import("../components/company-radar"), { ssr: false, loading: () => <div className="h-[250px]" /> });

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

const gradeColors: Record<string, string> = { A: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", B: "bg-lime-500/10 text-lime-500 border-lime-500/20", C: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", D: "bg-orange-500/10 text-orange-500 border-orange-500/20", E: "bg-red-500/10 text-red-500 border-red-500/20", F: "bg-red-600/10 text-red-600 border-red-600/20" };

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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse flex flex-col items-center gap-4"><div className="size-10 rounded-full bg-zinc-200 dark:bg-zinc-800" /><p className="text-zinc-500">Loading AI Healing Dashboard...</p></div></div>;
  if (error) return <div className="flex flex-col items-center justify-center p-8 text-center"><AlertCircle className="size-10 text-red-500 mb-4" /><p className="text-lg font-medium">Connection Error</p><p className="text-zinc-500">{error}</p></div>;

  const TrendIcon = dashboard?.pollution_trend === "improving" ? TrendingDown : dashboard?.pollution_trend === "worsening" ? TrendingUp : Minus;
  const trendColorClass = dashboard?.pollution_trend === "improving" ? "text-emerald-500" : dashboard?.pollution_trend === "worsening" ? "text-red-500" : "text-yellow-500";

  return (
    <div className="grid gap-4">
      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies Monitored</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_companies}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg RSE Score</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{dashboard?.avg_rse_score}</div>
              <Badge variant="outline" className={gradeColors[dashboard?.avg_grade || "D"]}>
                {dashboard?.avg_grade}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pollution {dashboard?.pollution_trend}</CardTitle>
            <TrendIcon className={`h-4 w-4 ${trendColorClass}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trendColorClass}`}>{Math.abs(dashboard?.pollution_change_pct || 0)}%</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Data Sources</CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.data_sources}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="size-5 text-indigo-600" />
              Pollution Trends — 12 Month Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PollutionChart data={pollution} />
          </CardContent>
        </Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart2 className="size-5 text-purple-600" />
              Current Pollutant Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopPollutants data={dashboard?.top_pollutants} />
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="size-5 text-blue-600" />
            Company RSE Rankings
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search companies..."
              className="pl-8 border-zinc-900/15 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-zinc-900/10 dark:border-white/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Env</TableHead>
                  <TableHead>Social</TableHead>
                  <TableHead>Gov</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((c, i) => (
                  <TableRow key={c.name} className={selectedCompany?.name === c.name ? "bg-zinc-100 dark:bg-white/5" : ""}>
                    <TableCell className="font-medium text-zinc-500">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">{c.sector}</TableCell>
                    <TableCell className={c.environmental_score > 50 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{c.environmental_score}</TableCell>
                    <TableCell className={c.social_score > 50 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{c.social_score}</TableCell>
                    <TableCell className={c.governance_score > 50 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>{c.governance_score}</TableCell>
                    <TableCell className="font-bold">{c.overall_score}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={gradeColors[c.grade]}>
                        {c.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => loadRecommendations(c)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompanies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Panel */}
      {selectedCompany && (
        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                RSE Recommendations — {selectedCompany.name}
              </CardTitle>
              <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                Current Grade: <Badge variant="outline" className={gradeColors[selectedCompany.grade]}>{selectedCompany.grade}</Badge> • Overall Score: {selectedCompany.overall_score}/100
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
              <div className="rounded-2xl border border-zinc-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                <CompanyRadar company={selectedCompany} />
              </div>
              <div className="space-y-3">
                {recsLoading ? (
                  <div className="flex h-32 items-center justify-center text-sm text-zinc-500">Loading recommendations...</div>
                ) : recommendations.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-sm text-zinc-500">No recommendations available.</div>
                ) : (
                  recommendations.map((r, i) => (
                    <div key={i} className="rounded-2xl border border-emerald-500/20 bg-white/80 p-4 dark:border-white/10 dark:bg-black/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={r.priority === "High" ? "destructive" : "secondary"}>
                          {r.priority} Priority
                        </Badge>
                        <span className="text-xs font-semibold text-zinc-500">{r.category}</span>
                        <span className="ml-auto text-xs font-bold text-emerald-600">+{r.impact_score} pts</span>
                      </div>
                      <h4 className="text-sm font-semibold">{r.title}</h4>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{r.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Section */}
      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="size-5 text-sky-600" />
            Gabès Environmental News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-zinc-900/10 bg-white/80 p-4 transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/5"
              >
                <div className="mb-2 text-xs text-zinc-500">{item.published}</div>
                <h3 className="mb-3 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</h3>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Read more →</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
