import { ImageResponse } from "next/og";
import { generateCreatorProfile, scoreCreator } from "../../../lib/scoring";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OGImage({ params }) {
  const { wallet } = await params;
  const profile = generateCreatorProfile(wallet);
  const { score, tier, signals } = scoreCreator(profile);
  const signalList = Object.values(signals);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080b0f",
          padding: "48px 56px",
          fontFamily: "monospace",
        }}
      >
        {/* Top: Brand + Tier */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 24, color: "#080b0f" }}>&#9672;</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#ffffff" }}>BagsProof</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>
                ON-CHAIN REPUTATION ORACLE
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 20px",
              borderRadius: 8,
              border: `2px solid ${tier.color}60`,
              background: tier.bg,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: tier.color }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: tier.color, letterSpacing: "0.12em" }}>
              TRUST TIER {tier.label}
            </span>
          </div>
        </div>

        {/* Middle: Score + Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 120, fontWeight: 800, color: tier.color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 36, color: "rgba(255,255,255,0.3)" }}>/100</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
              {wallet.slice(0, 8)}...{wallet.slice(-8)}
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                ["Launches", profile.totalLaunches],
                ["Graduated", profile.graduatedLaunches],
                ["Rugs", profile.ruggedLaunches],
                ["Fees", `${profile.lifetimeFeesSol.toFixed(1)} SOL`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Signal bars + URL */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {signalList.map((s) => {
              const pct = (s.score / s.max) * 100;
              const c = pct >= 80 ? "#00ff88" : pct >= 55 ? "#7fff80" : pct >= 35 ? "#ffd060" : "#ff6644";
              return (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4, width: 120 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</span>
                  <div style={{ display: "flex", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, color: c, fontWeight: 700 }}>{s.score}/{s.max}</span>
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>bagsproof.sh</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
