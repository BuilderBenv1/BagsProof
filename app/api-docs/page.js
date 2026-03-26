"use client";

import { useEffect } from "react";
import Link from "next/link";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/score/{wallet}",
    desc: "Get trust score for a wallet (mock engine, no API keys needed)",
    params: [{ name: "wallet", type: "path", desc: "Solana wallet address (base58, 32-44 chars)" }],
    response: `{
  "score": 67,
  "tier": "AA",
  "signals": {
    "graduationRate": { "label": "Graduation Rate", "score": 18, "max": 25 },
    "rugHistory": { "label": "Rug History", "score": 18, "max": 20 },
    ...
  },
  "profile": {
    "wallet": "7xKp...",
    "totalLaunches": 23,
    "graduatedLaunches": 17,
    "ruggedLaunches": 2,
    "lifetimeFeesSol": 22.63,
    "walletAgeDays": 331,
    ...
  }
}`,
  },
  {
    method: "GET",
    path: "/api/score?wallet={wallet}",
    desc: "Full live score using Bags API + Helius + DexScreener (requires API keys in .env.local)",
    params: [{ name: "wallet", type: "query", desc: "Solana wallet address" }],
    response: `{
  "wallet": "7xKp...",
  "score": 67,
  "tier": { "label": "AA", "color": "#7fffb0", "bg": "..." },
  "signals": { ... },
  "profile": { ... },
  "source": "live",
  "cachedAt": "2026-03-26T12:00:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/lookup?handle={handle}",
    desc: "Resolve a Twitter handle to a creator wallet address",
    params: [{ name: "handle", type: "query", desc: "Twitter username (with or without @)" }],
    response: `{
  "wallet": "7xKpQr9f...",
  "handle": "cryptofinn",
  "source": "live"  // or "mock" if no API key
}`,
  },
  {
    method: "GET",
    path: "/api/embed?wallet={wallet}",
    desc: "Returns a JavaScript snippet that renders a live trust badge",
    params: [{ name: "wallet", type: "query", desc: "Solana wallet address" }],
    response: `// JavaScript — embed with:
<script src="https://bagsproof.sh/api/embed?wallet=XXX"></script>`,
  },
];

function EndpointCard({ ep }) {
  return (
    <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ padding: "3px 10px", borderRadius: 4, background: ep.method === "GET" ? "rgba(0,255,136,0.1)" : "rgba(29,155,240,0.1)", border: `1px solid ${ep.method === "GET" ? "rgba(0,255,136,0.25)" : "rgba(29,155,240,0.25)"}`, color: ep.method === "GET" ? "#00ff88" : "#1d9bf0", fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em" }}>
          {ep.method}
        </span>
        <code style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "'Space Mono', monospace", wordBreak: "break-all" }}>{ep.path}</code>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 14px", lineHeight: 1.6 }}>{ep.desc}</p>

      {ep.params.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 8 }}>Parameters</div>
          {ep.params.map((p) => (
            <div key={p.name} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "baseline" }}>
              <code style={{ fontSize: 11, color: "#f0e060", fontFamily: "'Space Mono', monospace" }}>{p.name}</code>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", padding: "1px 6px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3 }}>{p.type}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.desc}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 8 }}>Response</div>
        <pre style={{ margin: 0, padding: 14, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "auto", lineHeight: 1.5, fontFamily: "'Space Mono', monospace" }}>
          {ep.response}
        </pre>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  useEffect(() => {
    document.title = "BagsProof | API Documentation";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } a { text-decoration: none; } pre { white-space: pre-wrap; word-break: break-word; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,136,0.3)" }}>
              <span style={{ fontSize: 16 }}>&#9672;</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>BagsProof</span>
          </Link>
          <Link href="/" style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            ← Home
          </Link>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          API <span style={{ color: "#00ff88" }}>Documentation</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, lineHeight: 1.6 }}>
          BagsProof exposes a free, public API for scoring Bags.fm creators. Build trust into your own tools.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.15)", color: "#00ff88" }}>Base URL: bagsproof.sh</span>
          <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>CORS enabled</span>
          <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>No auth required</span>
        </div>

        {/* Quick start */}
        <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(0,255,136,0.12)", background: "rgba(0,255,136,0.02)", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(0,255,136,0.5)", textTransform: "uppercase", marginBottom: 10 }}>Quick start</div>
          <pre style={{ margin: 0, padding: 14, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#00ff88", overflow: "auto", lineHeight: 1.8 }}>
{`# Score a creator wallet
curl https://bagsproof.sh/api/score/7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q

# Resolve a Twitter handle to wallet
curl https://bagsproof.sh/api/lookup?handle=cryptofinn

# Embed a badge
<script src="https://bagsproof.sh/api/embed?wallet=7xKp..."></script>`}
          </pre>
        </div>

        {/* Endpoints */}
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Endpoints</div>
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.path} ep={ep} />
        ))}

        {/* Scoring methodology */}
        <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Scoring methodology</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", gap: "6px 16px", fontSize: 11 }}>
            <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Signal</span>
            <span style={{ color: "rgba(255,255,255,0.35)", textAlign: "right" }}>Max</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Source</span>
            {[
              ["Graduation Rate", "25", "Bags /token-launch/feed"],
              ["Rug History", "20", "Bags analytics"],
              ["Holder Distribution", "15", "Helius RPC"],
              ["Lifetime Fees", "15", "Bags /lifetime-fees"],
              ["Wallet Age", "10", "Helius transactions"],
              ["Volume Consistency", "10", "DexScreener"],
              ["Social Verified", "5", "Bags /creator/v3"],
            ].map(([signal, max, source]) => (
              <div key={signal} style={{ display: "contents" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>{signal}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", textAlign: "right", padding: "4px 0" }}>{max}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", padding: "4px 0", fontSize: 10 }}>{source}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.03)", fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            <strong style={{ color: "rgba(255,255,255,0.45)" }}>Tiers:</strong> AAA (80-100) · AA (65-79) · A (50-64) · BBB (35-49) · C (0-34)
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>BAGSPROOF · ON-CHAIN REPUTATION ORACLE</span>
          <Link href="/" style={{ fontSize: 11, color: "rgba(0,255,136,0.6)", fontFamily: "'Space Mono', monospace" }}>
            ← bagsproof.sh
          </Link>
        </div>
      </div>
    </div>
  );
}
