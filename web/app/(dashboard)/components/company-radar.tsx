"use client";

import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

type Company = {
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
};

export default function CompanyRadar({ company }: { company?: Company | null }) {
  if (!company) return <div style={{ height: 250 }} />;
  const data = [
    { subject: "Environmental", score: company.environmental_score ?? 0, fullMark: 100 },
    { subject: "Social", score: company.social_score ?? 0, fullMark: 100 },
    { subject: "Governance", score: company.governance_score ?? 0, fullMark: 100 },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 13 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
        <Radar name="Score" dataKey="score" stroke="#34d399" fill="#34d399" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
