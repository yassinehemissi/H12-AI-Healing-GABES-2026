"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Point = { month: string; so2?: number; phosphogypsum?: number; heavy_metals?: number; wastewater?: number };

export default function PollutionChart({ data }: { data: Point[] }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gSO2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
          <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#e2e8f0" }} />
          <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "13px" }} />
          <Area type="monotone" dataKey="so2" name="SO₂ (ppm)" stroke="#ef4444" fill="url(#gSO2)" strokeWidth={2} />
          <Area type="monotone" dataKey="heavy_metals" name="Heavy Metals (mg/L)" stroke="#a855f7" fillOpacity={0.2} strokeWidth={2} />
          <Area type="monotone" dataKey="wastewater" name="Wastewater pH" stroke="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
