"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function EmbedPage() {
  useEffect(() => {
    document.title = "BagsProof | Embed Badge";
  }, []);

  const demoWallet = "7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q";
  const snippet = `<script src="https://bagsproof.sh/api/embed?wallet=YOUR_WALLET"></script>`;

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } a { text-decoration: none; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
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
          Embeddable <span style={{ color: "#00ff88" }}>Trust Badge</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.6 }}>
          Add a live BagsProof trust badge to any Bags token page with one line of HTML.
        </p>

        {/* Code snippet */}
        <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Embed code</div>
          <pre style={{ margin: 0, padding: 16, borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#00ff88", overflow: "auto", lineHeight: 1.6 }}>
            <code>{snippet}</code>
          </pre>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 10, marginBottom: 0 }}>
            Replace <span style={{ color: "#f0e060" }}>YOUR_WALLET</span> with the creator&apos;s wallet address.
          </p>
        </div>

        {/* How it works */}
        <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "1. The script fetches the creator's trust score from the BagsProof API",
              "2. A compact badge is rendered inline showing the tier and score",
              "3. Clicking the badge links to the full score card on bagsproof.sh",
              "4. Scores are cached for 5 minutes and update automatically",
            ].map((step) => (
              <div key={step} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step}</div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div style={{ padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Preview</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href={`/score/${demoWallet}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: "#0d1117", border: "1px solid rgba(0,255,136,0.25)" }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>BagsProof</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#7fffb0" }}>AA 67/100</span>
            </Link>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>← live badge preview</span>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>BAGSPROOF · ON-CHAIN REPUTATION ORACLE</span>
        </div>
      </div>
    </div>
  );
}
