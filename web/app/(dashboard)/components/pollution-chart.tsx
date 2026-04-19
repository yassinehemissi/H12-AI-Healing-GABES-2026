"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Point = { month: string; so2?: number; phosphogypsum?: number; heavy_metals?: number; wastewater?: number };

export default function PollutionChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gSO2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gHeavy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gWaste" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" vertical={false} />
          <XAxis dataKey="month" stroke="currentColor" className="text-xs text-zinc-500" tickLine={false} axisLine={false} />
          <YAxis stroke="currentColor" className="text-xs text-zinc-500" tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--foreground)" }} 
          />
          <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "13px" }} />
          <Area type="monotone" dataKey="so2" name="SO₂ (ppm)" stroke="#ef4444" fill="url(#gSO2)" strokeWidth={2} />
          <Area type="monotone" dataKey="heavy_metals" name="Heavy Metals (mg/L)" stroke="#a855f7" fill="url(#gHeavy)" strokeWidth={2} />
          <Area type="monotone" dataKey="wastewater" name="Wastewater pH" stroke="#06b6d4" fill="url(#gWaste)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
