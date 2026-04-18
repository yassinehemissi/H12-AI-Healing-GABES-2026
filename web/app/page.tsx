import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%)", color: "#e2e8f0", fontFamily: "var(--font-sans)" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50, background: "rgba(15,23,42,0.85)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="url(#navlg)" strokeWidth="2.5" />
            <path d="M18 8 C12 14, 10 20, 18 28 C26 20, 24 14, 18 8Z" fill="url(#navlg)" opacity="0.8" />
            <defs><linearGradient id="navlg" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#34d399" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(90deg, #34d399, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Healing Gabès</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link href="/dashboard" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.2s" }}>Dashboard</Link>
          <Link href="/dashboard/analytics" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>AI Analytics</Link>
          <Link href="/dashboard" style={{ background: "linear-gradient(90deg, #34d399, #06b6d4)", color: "#0f172a", padding: "0.5rem 1.25rem", borderRadius: "9999px", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 4rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "9999px", padding: "0.35rem 1rem", fontSize: "0.8rem", color: "#34d399", marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
          H12 Hackathon by ESPRIT 2026 • Synaptech Team
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.5rem", background: "linear-gradient(135deg, #f1f5f9 30%, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Environmental Intelligence<br />for the Gabès Industrial Zone
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
          AI-powered pollution monitoring, RSE scoring, and dynamic analytics for industrial companies in Gabès, Tunisia.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ background: "linear-gradient(90deg, #34d399, #06b6d4)", color: "#0f172a", padding: "0.85rem 2rem", borderRadius: "9999px", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
            Open Dashboard →
          </Link>
          <Link href="/dashboard/analytics" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", padding: "0.85rem 2rem", borderRadius: "9999px", fontWeight: 600, fontSize: "1rem", textDecoration: "none" }}>
            AI Analytics
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "4rem auto", padding: "0 2rem" }}>
        {[
          { icon: "📊", title: "Live Dashboard", desc: "Real-time KPIs, pollution trends, and company RSE rankings for the Gabès industrial zone.", href: "/dashboard" },
          { icon: "🤖", title: "AI Analytics", desc: "Ask natural language questions about pollution and RSE data — get instant AI-generated charts.", href: "/dashboard/analytics" },
          { icon: "🏭", title: "Company Scoring", desc: "Environmental, social, and governance scores with actionable improvement recommendations.", href: "/dashboard" },
        ].map((f) => (
          <Link key={f.title} href={f.href} style={{ textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "2rem", transition: "border-color 0.2s", display: "block" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#f1f5f9", marginBottom: "0.5rem" }}>{f.title}</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
          </Link>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "2rem", color: "#475569", fontSize: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "4rem" }}>
        AI Healing Gabès — Synaptech Team • H12 Hackathon by ESPRIT 2026
      </footer>
    </div>
  );
}
