"use client";

import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

type Company = {
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
};

export default function CompanyRadar({ company }: { company?: Company | null }) {
  if (!company) return <div className="h-[250px] w-full" />;
  const data = [
    { subject: "Environmental", score: company.environmental_score ?? 0, fullMark: 100 },
    { subject: "Social", score: company.social_score ?? 0, fullMark: 100 },
    { subject: "Governance", score: company.governance_score ?? 0, fullMark: 100 },
  ];
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid className="stroke-zinc-200 dark:stroke-zinc-800" />
          <PolarAngleAxis dataKey="subject" className="text-xs font-medium text-zinc-500" tick={{ fill: 'currentColor' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs text-zinc-400" tick={{ fill: 'currentColor' }} />
          <Tooltip 
             contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--foreground)" }} 
          />
          <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
