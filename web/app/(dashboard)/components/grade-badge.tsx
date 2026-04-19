"use client";

import React from "react";

const COLORS: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  E: "#ef4444",
  F: "#dc2626",
};

export default function GradeBadge({ grade }: { grade?: string }) {
  const g = (grade || "C").toUpperCase();
  const color = COLORS[g] || COLORS["C"];
  return (
    <span
      className="grade-badge-sm"
      style={{ backgroundColor: `${color}33`, color: color, boxShadow: "none" }}
    >
      {g}
    </span>
  );
}
