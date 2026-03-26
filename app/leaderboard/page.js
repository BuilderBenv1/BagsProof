"use client";

import { useState, useEffect } from "react";
import { generateLeaderboard } from "../../lib/scoring";
import Link from "next/link";

function RankBadge({ rank }) {
  const medals = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const medalColor = medals[rank];
  if (medalColor) {
    return (
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${medalColor}18`, border: `2px solid ${medalColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace", fontWeight: 800, fontSize: 13, color: medalColor, boxShadow: `0 0 12px ${medalColor}40`, flexShrink: 0 }}>
        {rank}
      </div>
    );
  }
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
      {rank}
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = "Creator Leaderboard | BagsProof";
    setEntries(generateLeaderboard(50));
    setTimeout(() => setLoaded(true), 50);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", position: "relative", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; } @media (max-width: 700px) { .lb-hide-mobile { display: none !important; } .lb-table-row { padding: 12px 12px !important; } }`}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(0,255,136,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,136,0.3)" }}>
                <span style={{ fontSize: 16 }}>&#9672;</span>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>BagsProof</span>
            </Link>
            <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none", fontFamily: "'Space Mono', monospace", padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              ← Home
            </Link>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 42px)", color: "#fff", margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Creator <span style={{ color: "#00ff88" }}>Leaderboard</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, fontFamily: "'Space Mono', monospace" }}>
            Top-rated Bags.fm creators by trust score
          </p>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 90px 60px 80px 80px 80px", alignItems: "center", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
          {["#", "Wallet", "Tier", "Score", "Launches", "Grad", "Fees"].map((header, i) => (
            <span key={header} className={i >= 4 ? "lb-hide-mobile" : undefined} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace", textAlign: i >= 3 ? "right" : "left" }}>
              {header}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div>
          {entries.map((entry, i) => {
            const medals = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
            const accentColor = medals[entry.rank];
            const isTop3 = entry.rank <= 3;
            const isHovered = hoveredRow === i;

            return (
              <Link key={entry.wallet} href={`/score/${entry.wallet}`} style={{ textDecoration: "none", color: "inherit" }}
                onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                <div className="lb-table-row" style={{
                  display: "grid", gridTemplateColumns: "48px 1fr 90px 60px 80px 80px 80px", alignItems: "center",
                  padding: "14px 20px", borderRadius: 10,
                  border: `1px solid ${isTop3 && isHovered ? accentColor + "40" : isHovered ? "rgba(255,255,255,0.08)" : "transparent"}`,
                  background: isTop3 ? (isHovered ? `${accentColor}10` : `${accentColor}06`) : (isHovered ? "rgba(255,255,255,0.03)" : "transparent"),
                  marginBottom: 2, transition: "all 0.2s ease", cursor: "pointer",
                  opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(8px)",
                  transitionDelay: `${i * 20}ms`, transitionProperty: "all", transitionDuration: "0.4s",
                }}>
                  <div><RankBadge rank={entry.rank} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isTop3 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)", fontFamily: "'Space Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                    {entry.wallet.slice(0, 4)}...{entry.wallet.slice(-4)}
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 5, border: `1px solid ${entry.tier.color}40`, background: entry.tier.bg, fontSize: 11, fontWeight: 700, color: entry.tier.color, letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: entry.tier.color, boxShadow: `0 0 4px ${entry.tier.color}`, flexShrink: 0 }} />
                      {entry.tier.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: entry.tier.color, fontFamily: "'Space Mono', monospace", textAlign: "right" }}>{entry.score}</div>
                  <div className="lb-hide-mobile" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace", textAlign: "right" }}>{entry.profile.totalLaunches}</div>
                  <div className="lb-hide-mobile" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace", textAlign: "right" }}>{entry.profile.graduatedLaunches}</div>
                  <div className="lb-hide-mobile" style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Space Mono', monospace", textAlign: "right" }}>◎ {entry.profile.lifetimeFeesSol.toFixed(1)}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace", margin: 0 }}>
            Scores are deterministic and derived from on-chain activity. Click any row to view the full trust score card.
          </p>
        </div>
      </div>
    </div>
  );
}
