"use client";

import React from "react";

type Props = {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  color?: string;
};

export default function KpiCard({ icon, value, label, badge, color }: Props) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: "rgba(255,255,255,0.03)", color: color || "#34d399" }}>
        {icon}
      </div>
      <div className="kpi-content">
        <span className="kpi-value">
          {value}
          {badge && <span style={{ marginLeft: 8 }}>{badge}</span>}
        </span>
        <span className="kpi-label">{label}</span>
      </div>
    </div>
  );
}
