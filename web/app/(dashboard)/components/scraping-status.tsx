"use client";

import React, { useEffect, useState } from "react";

export default function ScrapingStatus() {
  const [status, setStatus] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/scraping/status`);
        if (!res.ok) throw new Error("status fetch failed");
        const j = await res.json();
        if (!mounted) return;
        setStatus(j.status || "idle");
        setLastRun(j.last_run || null);
      } catch {
        if (mounted) setStatus("unavailable");
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="status-panel">
      <div className="status-header">Scraping Status</div>
      <div className="status-body">
        <div>Status: <strong>{status || "idle"}</strong></div>
        <div>Last run: <span>{lastRun || "—"}</span></div>
      </div>
    </div>
  );
}
