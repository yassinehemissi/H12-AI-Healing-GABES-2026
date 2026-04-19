"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Pollutant = { name: string; value: number; unit?: string };

export default function TopPollutants({ data }: { data?: Pollutant[] }) {
  const chartData = (data || []).map((p) => ({ ...p, label: p.name }));
  const colors = ["#ef4444", "#f97316", "#a855f7", "#06b6d4"];
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" vertical={false} />
          <XAxis dataKey="label" stroke="currentColor" className="text-xs text-zinc-500" tickLine={false} axisLine={false} />
          <YAxis stroke="currentColor" className="text-xs text-zinc-500" tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--foreground)" }} 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
