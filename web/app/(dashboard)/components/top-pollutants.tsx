"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Pollutant = { name: string; value: number; unit?: string };

export default function TopPollutants({ data }: { data?: Pollutant[] }) {
  const chartData = (data || []).map((p) => ({ ...p, label: p.name }));
  const colors = ["#ef4444", "#f97316", "#a855f7", "#06b6d4"];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#e2e8f0" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
