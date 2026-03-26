"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { generateCreatorProfile, scoreCreator, DEMO_WALLETS } from "../lib/scoring";

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

  const handleLookup = async (input = inputWallet.trim()) => {
    if (!input) return;
    setLoading(true);
    try {
      let wallet = input;

      // Detect @handle and resolve to wallet
      if (input.startsWith("@") || (!input.includes("...") && input.length < 32)) {
        const handle = input.replace(/^@/, "");
        const lookupRes = await fetch(`/api/lookup?handle=${encodeURIComponent(handle)}`);
        const lookupData = await lookupRes.json();
        if (lookupRes.ok && lookupData.wallet) {
          wallet = lookupData.wallet;
          setInputWallet(wallet);
        } else {
          setActiveResult(null);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/score?wallet=${encodeURIComponent(wallet)}`);
      const data = await res.json();
      if (res.ok && data.score !== undefined) {
        setActiveResult({ ...data, isLive: data.source === "live" });
      } else {
        const profile = generateCreatorProfile(wallet);
        setActiveResult({ ...scoreCreator(profile), isLive: false });
      }
    } catch {
      const profile = generateCreatorProfile(input);
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
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Link href="/leaderboard" style={{ textDecoration: "none", padding: "8px 16px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00ff88", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
              Leaderboard
            </Link>
            <Link href="/embed" style={{ textDecoration: "none", padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              Embed Badge
            </Link>
          </div>
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
                Lookup wallet or @handle
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={inputWallet}
                  onChange={(e) => setInputWallet(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="Wallet or @twitter..."
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
                    {/* Share + View buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`BagsProof trust score: ${activeResult.tier.label} ${activeResult.score}/100\n\nCheck any Bags.fm creator:\nbagsproof.sh/score/${activeResult.profile.wallet}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ padding: "6px 14px", borderRadius: 5, background: "rgba(29,155,240,0.12)", border: "1px solid rgba(29,155,240,0.25)", color: "#1d9bf0", fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace", textDecoration: "none" }}>
                        Share on X
                      </a>
                      <Link href={`/score/${activeResult.profile.wallet}`}
                        style={{ padding: "6px 14px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "'Space Mono', monospace", textDecoration: "none" }}>
                        Shareable Link
                      </Link>
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
