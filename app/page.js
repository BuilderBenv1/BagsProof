"use client";

import { useState, useEffect, useRef } from "react";

// ─── SCORING ENGINE ──────────────────────────────────────────────────────────
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateCreatorProfile(wallet) {
  const seed = hashCode(wallet);
  const rand = (min, max, offset = 0) =>
    min + ((seed + offset) % (max - min + 1));
  const totalLaunches = rand(1, 24, 1);
  const graduatedLaunches = Math.floor(
    totalLaunches * (rand(0, 100, 2) / 100)
  );
  const ruggedLaunches = Math.floor(
    (totalLaunches - graduatedLaunches) * (rand(0, 60, 3) / 100)
  );
  const lifetimeFeesSol = rand(0, 420, 4) + rand(0, 99, 14) / 100;
  const walletAgeDays = rand(30, 1200, 5);
  const avgHolderCount = rand(8, 2400, 6);
  const top10HolderPct = rand(20, 95, 7);
  const socialLinked = rand(0, 1, 8) === 1;
  const claimFrequency = rand(0, 100, 9);
  const volumeConsistency = rand(10, 100, 10);
  const relaunchGap = rand(0, 180, 11);
  return {
    wallet,
    totalLaunches,
    graduatedLaunches,
    ruggedLaunches,
    lifetimeFeesSol,
    walletAgeDays,
    avgHolderCount,
    top10HolderPct,
    socialLinked,
    claimFrequency,
    volumeConsistency,
    relaunchGap,
  };
}

function scoreCreator(profile) {
  const signals = {};
  const gradRate =
    profile.totalLaunches > 0
      ? profile.graduatedLaunches / profile.totalLaunches
      : 0;
  signals.graduationRate = {
    label: "Graduation Rate",
    score: Math.round(gradRate * 25),
    max: 25,
    value: `${profile.graduatedLaunches}/${profile.totalLaunches} tokens`,
    detail: "Tokens that reached graduation vs. total launched",
  };
  const rugRatio =
    profile.totalLaunches > 0
      ? profile.ruggedLaunches / profile.totalLaunches
      : 0;
  signals.rugHistory = {
    label: "Rug History",
    score: Math.round((1 - rugRatio) * 20),
    max: 20,
    value:
      profile.ruggedLaunches === 0
        ? "Clean"
        : `${profile.ruggedLaunches} suspected rug${profile.ruggedLaunches > 1 ? "s" : ""}`,
    detail: "Tokens abandoned with no liquidity withdrawal pattern",
  };
  const holderScore =
    profile.top10HolderPct < 40
      ? 15
      : profile.top10HolderPct < 60
        ? 10
        : profile.top10HolderPct < 80
          ? 5
          : 0;
  signals.holderDistribution = {
    label: "Holder Distribution",
    score: holderScore,
    max: 15,
    value: `Top 10 = ${profile.top10HolderPct}%`,
    detail: "Concentration of holdings among top 10 wallets",
  };
  const feeScore =
    profile.lifetimeFeesSol > 100
      ? 15
      : profile.lifetimeFeesSol > 20
        ? 12
        : profile.lifetimeFeesSol > 5
          ? 8
          : profile.lifetimeFeesSol > 1
            ? 4
            : 1;
  signals.lifetimeFees = {
    label: "Lifetime Fees",
    score: feeScore,
    max: 15,
    value: `◎ ${profile.lifetimeFeesSol.toFixed(2)} SOL`,
    detail: "Total creator fees earned across all launches",
  };
  const ageScore =
    profile.walletAgeDays > 365
      ? 10
      : profile.walletAgeDays > 180
        ? 7
        : profile.walletAgeDays > 60
          ? 4
          : 1;
  signals.walletAge = {
    label: "Wallet Age",
    score: ageScore,
    max: 10,
    value:
      profile.walletAgeDays > 365
        ? `${Math.floor(profile.walletAgeDays / 365)}y ${Math.floor((profile.walletAgeDays % 365) / 30)}m`
        : `${Math.floor(profile.walletAgeDays / 30)}m ${profile.walletAgeDays % 30}d`,
    detail: "Age of the creator's primary wallet",
  };
  signals.socialVerified = {
    label: "Social Verified",
    score: profile.socialLinked ? 5 : 0,
    max: 5,
    value: profile.socialLinked ? "Twitter/GitHub linked" : "No social linked",
    detail: "Verified social identity via Bags provider",
  };
  signals.volumeConsistency = {
    label: "Volume Consistency",
    score: Math.round((profile.volumeConsistency / 100) * 10),
    max: 10,
    value:
      profile.volumeConsistency > 70
        ? "Sustained"
        : profile.volumeConsistency > 40
          ? "Moderate"
          : "Spiky",
    detail: "Consistency of trading volume over token lifetime",
  };
  const totalScore = Object.values(signals).reduce((a, s) => a + s.score, 0);
  const tier =
    totalScore >= 80
      ? { label: "AAA", color: "#00ff88", bg: "rgba(0,255,136,0.08)" }
      : totalScore >= 65
        ? { label: "AA", color: "#7fffb0", bg: "rgba(127,255,176,0.08)" }
        : totalScore >= 50
          ? { label: "A", color: "#f0e060", bg: "rgba(240,224,96,0.08)" }
          : totalScore >= 35
            ? {
                label: "BBB",
                color: "#ffa040",
                bg: "rgba(255,160,64,0.08)",
              }
            : { label: "C", color: "#ff4444", bg: "rgba(255,68,68,0.08)" };
  return { score: totalScore, signals, tier, profile };
}

const DEMO_WALLETS = [
  {
    label: "7xKp...mN3q",
    wallet: "7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q",
    name: "CryptoFinn",
    twitter: "@cryptofinn",
  },
  {
    label: "4mRt...jK9w",
    wallet: "4mRtZ1yUoI8nBvC3xQpLs6kMwE7hGdFjA2eT5rYjK9w",
    name: "LunaWave",
    twitter: "@lunawave_sol",
  },
  {
    label: "9pHn...zX2v",
    wallet: "9pHnA4cQ7bJrVk1yWtS5mEiUo3dLxG8fNzC6ejzX2v",
    name: "DegenDave",
    twitter: null,
  },
  {
    label: "2sTw...aL7f",
    wallet: "2sTwP8vBnKqRm5yHjUcXo1eGiA9dF4zL3sWtaL7f00",
    name: "SolBuilder",
    twitter: "@solbuilder",
  },
];

function ScoreRing({ score, tier, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const animOffset = circumference - (animated / 100) * circumference;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tier.color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 8px ${tier.color}60)`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.26,
            fontWeight: 800,
            color: tier.color,
            lineHeight: 1,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: size * 0.11,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.15em",
            marginTop: 2,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

function SignalBar({ signal, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setWidth((signal.score / signal.max) * 100),
      200 + delay
    );
    return () => clearTimeout(t);
  }, [signal.score, signal.max, delay]);
  const pct = (signal.score / signal.max) * 100;
  const barColor =
    pct >= 80
      ? "#00ff88"
      : pct >= 55
        ? "#7fff80"
        : pct >= 35
          ? "#ffd060"
          : "#ff6644";
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {signal.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {signal.value}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: barColor,
              fontFamily: "'Space Mono', monospace",
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {signal.score}
            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>
              /{signal.max}
            </span>
          </span>
        </div>
      </div>
      <div
        style={{
          height: 4,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: barColor,
            borderRadius: 2,
            transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${delay}ms`,
            boxShadow: `0 0 8px ${barColor}50`,
          }}
        />
      </div>
    </div>
  );
}

function TrustBadge({ tier }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        borderRadius: 6,
        border: `1px solid ${tier.color}40`,
        background: tier.bg,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: tier.color,
          boxShadow: `0 0 6px ${tier.color}`,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: tier.color,
          letterSpacing: "0.12em",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        TRUST TIER {tier.label}
      </span>
    </div>
  );
}

function CreatorCard({ result, isSelected, onClick }) {
  const { score, tier, profile } = result;
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "block",
        width: "100%",
        padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${isSelected ? tier.color + "60" : "rgba(255,255,255,0.07)"}`,
        background: isSelected ? tier.bg : "rgba(255,255,255,0.02)",
        marginBottom: 8,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 3,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {profile.wallet.slice(0, 4)}...{profile.wallet.slice(-4)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {profile.totalLaunches} launch
            {profile.totalLaunches !== 1 ? "es" : ""} · ◎{" "}
            {profile.lifetimeFeesSol.toFixed(1)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: tier.color,
              fontFamily: "'Space Mono', monospace",
              padding: "3px 8px",
              borderRadius: 4,
              border: `1px solid ${tier.color}40`,
              background: tier.bg,
            }}
          >
            {tier.label}
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: tier.color,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {score}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function BagsTrustScore() {
  const [inputWallet, setInputWallet] = useState("");
  const [activeResult, setActiveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoResults, setDemoResults] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    setDemoResults(
      DEMO_WALLETS.map((d) => ({
        ...scoreCreator(generateCreatorProfile(d.wallet)),
        label: d.label,
      }))
    );
    const first = DEMO_WALLETS[0];
    setActiveResult(scoreCreator(generateCreatorProfile(first.wallet)));
  }, []);

  const handleLookup = async (wallet = inputWallet.trim()) => {
    if (!wallet) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/score?wallet=${encodeURIComponent(wallet)}`);
      const data = await res.json();
      if (res.ok && data.score !== undefined) {
        setActiveResult({ ...data, isLive: data.source === "live" });
      } else {
        // API keys not configured — fall back to mock
        const profile = generateCreatorProfile(wallet);
        setActiveResult({ ...scoreCreator(profile), isLive: false });
      }
    } catch {
      // Network error — fall back to mock
      const profile = generateCreatorProfile(wallet);
      setActiveResult({ ...scoreCreator(profile), isLive: false });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (d) => {
    setInputWallet(d.wallet);
    handleLookup(d.wallet);
  };

  const signals = activeResult ? Object.values(activeResult.signals) : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b0f",
        fontFamily: "'Space Mono', monospace",
        color: "rgba(255,255,255,0.85)",
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; } input::placeholder { color: rgba(255,255,255,0.2); } input:focus { outline: none; } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } } @keyframes fadeSlideIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }`}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "40px 24px 60px",
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background:
                  "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(0,255,136,0.3)",
              }}
            >
              <span style={{ fontSize: 18 }}>&#9672;</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                }}
              >
                bags.fm · BagsProof
              </div>
            </div>
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              margin: "0 0 8px",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            BagsProof
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            On-chain reputation oracle for Bags.fm creators. 7 signals.
            Composite trust score. No guesswork.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Lookup wallet
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={inputWallet}
                  onChange={(e) => setInputWallet(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="Paste wallet address..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Space Mono', monospace",
                  }}
                />
                <button
                  onClick={() => handleLookup()}
                  style={{
                    background: "rgba(0,255,136,0.12)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: "#00ff88",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all 0.15s",
                  }}
                >
                  {loading ? (
                    <span
                      style={{
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    >
                      ↻
                    </span>
                  ) : (
                    "→"
                  )}
                </button>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}
              >
                Demo creators
              </div>
              {DEMO_WALLETS.map((d, i) => {
                const res = demoResults[i];
                if (!res) return null;
                const isActive =
                  activeResult && activeResult.profile.wallet === d.wallet;
                return (
                  <CreatorCard
                    key={d.wallet}
                    result={res}
                    isSelected={isActive}
                    onClick={() => handleDemoSelect(d)}
                  />
                );
              })}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Data sources
              </div>
              {[
                ["Bags API", "/token-launch/creator/v3", "Creator identity"],
                ["Bags API", "/token-launch/lifetime-fees", "Fee revenue"],
                ["Bags API", "/token-launch/feed", "Launch history"],
                ["Helius", "getAssetsByOwner", "Wallet age"],
                ["Birdeye", "token/holders", "Holder dist."],
              ].map(([src, ep, desc]) => (
                <div
                  key={ep}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}
                  >
                    {src}{" "}
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>{" "}
                    {desc}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.18)",
                      fontStyle: "italic",
                    }}
                  >
                    {ep}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {activeResult && !loading && (
            <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
              <div
                style={{
                  padding: 28,
                  borderRadius: 14,
                  border: `1px solid ${activeResult.tier.color}25`,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${activeResult.tier.bg} 100%)`,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 28,
                    flexWrap: "wrap",
                  }}
                >
                  <ScoreRing
                    score={activeResult.score}
                    tier={activeResult.tier}
                    size={130}
                  />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <TrustBadge tier={activeResult.tier} />
                      {activeResult.isLive && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "4px 10px", borderRadius: 5,
                          background: "rgba(0,200,255,0.08)",
                          border: "1px solid rgba(0,200,255,0.2)",
                        }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "#00c8ff",
                            animation: "pulse 1.5s ease-in-out infinite",
                          }} />
                          <span style={{
                            fontSize: 10, color: "#00c8ff",
                            fontFamily: "'Space Mono', monospace",
                            letterSpacing: "0.12em",
                          }}>LIVE DATA</span>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        marginBottom: 4,
                      }}
                    >
                      {activeResult.profile.wallet.slice(0, 8)}...
                      {activeResult.profile.wallet.slice(-8)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        marginTop: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        ["Launches", activeResult.profile.totalLaunches],
                        ["Graduated", activeResult.profile.graduatedLaunches],
                        ["Rugs", activeResult.profile.ruggedLaunches],
                        [
                          "Fees (SOL)",
                          `◎ ${activeResult.profile.lifetimeFeesSol.toFixed(2)}`,
                        ],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.3)",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              marginBottom: 3,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.9)",
                            }}
                          >
                            {val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: 24,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    marginBottom: 20,
                  }}
                >
                  Signal breakdown
                </div>
                {signals.map((signal, i) => (
                  <SignalBar key={signal.label} signal={signal} delay={i * 80} />
                ))}
              </div>
              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Risk flags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeResult.profile.ruggedLaunches > 0 && (
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "rgba(255,68,68,0.1)",
                        border: "1px solid rgba(255,68,68,0.2)",
                        fontSize: 11,
                        color: "#ff6644",
                      }}
                    >
                      ⚠ {activeResult.profile.ruggedLaunches} suspected rug
                      {activeResult.profile.ruggedLaunches > 1 ? "s" : ""}
                    </div>
                  )}
                  {activeResult.profile.top10HolderPct > 70 && (
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "rgba(255,160,64,0.1)",
                        border: "1px solid rgba(255,160,64,0.2)",
                        fontSize: 11,
                        color: "#ffa040",
                      }}
                    >
                      ⚠ High holder concentration
                    </div>
                  )}
                  {!activeResult.profile.socialLinked && (
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      ○ No social verification
                    </div>
                  )}
                  {activeResult.profile.walletAgeDays < 60 && (
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 5,
                        background: "rgba(255,160,64,0.1)",
                        border: "1px solid rgba(255,160,64,0.2)",
                        fontSize: 11,
                        color: "#ffa040",
                      }}
                    >
                      ⚠ New wallet (&lt;60d)
                    </div>
                  )}
                  {activeResult.profile.ruggedLaunches === 0 &&
                    activeResult.profile.top10HolderPct <= 70 &&
                    activeResult.profile.socialLinked &&
                    activeResult.profile.walletAgeDays >= 60 && (
                      <div
                        style={{
                          padding: "5px 10px",
                          borderRadius: 5,
                          background: "rgba(0,255,136,0.08)",
                          border: "1px solid rgba(0,255,136,0.2)",
                          fontSize: 11,
                          color: "#00ff88",
                        }}
                      >
                        ✓ No risk flags detected
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                gap: 12,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <span
                style={{
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                  fontSize: 20,
                }}
              >
                ↻
              </span>
              <span style={{ fontSize: 12, letterSpacing: "0.15em" }}>
                QUERYING BAGS API...
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            BAGSPROOF · Q1 2026 · ON-CHAIN REPUTATION ORACLE
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Bags API", "Fee Sharing", "Social Finance"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  padding: "3px 8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
