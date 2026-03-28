import { generateCreatorProfile, scoreCreator } from "../../../lib/scoring";
import { DEMO_VERIFIED } from "../../../lib/proof-token";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { wallet } = await params;
  const profile = generateCreatorProfile(wallet);
  const { score, tier } = scoreCreator(profile);
  return {
    title: `BagsProof | ${tier.label} ${score}/100`,
    description: `Creator trust score for ${wallet.slice(0, 8)}...${wallet.slice(-4)} — ${tier.label} rated with ${score}/100 on BagsProof`,
    openGraph: {
      title: `BagsProof | ${tier.label} ${score}/100`,
      description: `Creator trust score for ${wallet.slice(0, 8)}...${wallet.slice(-4)}`,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

function StaticRing({ score, tier, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tier.color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${tier.color}60)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: tier.color, lineHeight: 1, fontFamily: "monospace" }}>{score}</span>
        <span style={{ fontSize: size * 0.11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginTop: 2, fontFamily: "monospace" }}>/100</span>
      </div>
    </div>
  );
}

export default async function ScorePage({ params }) {
  const { wallet } = await params;
  const profile = generateCreatorProfile(wallet);
  const result = scoreCreator(profile);
  const { score, tier, signals } = result;
  const signalList = Object.values(signals);

  const shareText = encodeURIComponent(
    `My BagsProof trust score: ${tier.label} ${score}/100\n\nCheck any Bags.fm creator:\nbagsproof.sh/score/${wallet}`
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", padding: 0, position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } a { text-decoration: none; }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,136,0.3)" }}>
              <span style={{ fontSize: 16 }}>&#9672;</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>BagsProof</span>
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(29,155,240,0.15)", border: "1px solid rgba(29,155,240,0.3)", color: "#1d9bf0", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
              Share on X
            </a>
            <Link href="/leaderboard" style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Score Card */}
        <div style={{ padding: 28, borderRadius: 14, border: `1px solid ${tier.color}25`, background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${tier.bg} 100%)`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <StaticRing score={score} tier={tier} size={140} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 6, border: `1px solid ${tier.color}40`, background: tier.bg, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color, boxShadow: `0 0 6px ${tier.color}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace" }}>TRUST TIER {tier.label}</span>
              </div>
              {DEMO_VERIFIED.includes(wallet) && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5, background: "rgba(171,56,255,0.1)", border: "1px solid rgba(171,56,255,0.25)", marginBottom: 8 }}>
                  <span style={{ fontSize: 10 }}>&#128737;</span>
                  <span style={{ fontSize: 10, color: "#ab38ff", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", fontWeight: 700 }}>VERIFIED</span>
                </div>
              )}
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                {wallet.slice(0, 8)}...{wallet.slice(-8)}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  ["Launches", profile.totalLaunches],
                  ["Graduated", profile.graduatedLaunches],
                  ["Rugs", profile.ruggedLaunches],
                  ["Fees (SOL)", `◎ ${profile.lifetimeFeesSol.toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signal Breakdown */}
        <div style={{ padding: 24, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 20 }}>Signal breakdown</div>
          {signalList.map((signal) => {
            const pct = (signal.score / signal.max) * 100;
            const barColor = pct >= 80 ? "#00ff88" : pct >= 55 ? "#7fff80" : pct >= 35 ? "#ffd060" : "#ff6644";
            return (
              <div key={signal.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>{signal.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>{signal.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: barColor, fontFamily: "'Space Mono', monospace", minWidth: 32, textAlign: "right" }}>
                      {signal.score}<span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>/{signal.max}</span>
                    </span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, boxShadow: `0 0 8px ${barColor}50` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Flags */}
        <div style={{ padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 16 }}>Risk flags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.ruggedLaunches > 0 && (
              <div style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", fontSize: 11, color: "#ff6644" }}>
                ⚠ {profile.ruggedLaunches} suspected rug{profile.ruggedLaunches > 1 ? "s" : ""}
              </div>
            )}
            {profile.top10HolderPct > 70 && (
              <div style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,160,64,0.1)", border: "1px solid rgba(255,160,64,0.2)", fontSize: 11, color: "#ffa040" }}>
                ⚠ High holder concentration
              </div>
            )}
            {!profile.socialLinked && (
              <div style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                ○ No social verification
              </div>
            )}
            {profile.walletAgeDays < 60 && (
              <div style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(255,160,64,0.1)", border: "1px solid rgba(255,160,64,0.2)", fontSize: 11, color: "#ffa040" }}>
                ⚠ New wallet (&lt;60d)
              </div>
            )}
            {profile.ruggedLaunches === 0 && profile.top10HolderPct <= 70 && profile.socialLinked && profile.walletAgeDays >= 60 && (
              <div style={{ padding: "5px 10px", borderRadius: 5, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", fontSize: 11, color: "#00ff88" }}>
                ✓ No risk flags detected
              </div>
            )}
          </div>
        </div>

        {/* How to improve */}
        {(() => {
          const tips = [];
          if (!profile.socialLinked)
            tips.push({ text: "Link your Twitter or GitHub", pts: "+5 pts", color: "#00ff88", detail: "Verify your identity via Bags social provider" });
          if (signals.graduationRate && signals.graduationRate.score < 20)
            tips.push({ text: "Graduate more tokens", pts: `+${20 - signals.graduationRate.score} pts potential`, color: "#7fffb0", detail: "Tokens that reach graduation boost your score significantly" });
          if (profile.top10HolderPct > 70)
            tips.push({ text: "Improve holder distribution", pts: `+${Math.min(15, Math.floor((profile.top10HolderPct - 40) / 10) * 5)} pts potential`, color: "#f0e060", detail: "Wider token distribution among holders signals healthier markets" });
          if (profile.ruggedLaunches > 0)
            tips.push({ text: "Avoid abandoned launches", pts: `+${Math.min(10, profile.ruggedLaunches * 4)} pts recoverable`, color: "#ffa040", detail: "Each suspected rug reduces your trust score" });
          if (profile.walletAgeDays < 180)
            tips.push({ text: "Build wallet history", pts: "+3-6 pts over time", color: "#7fffb0", detail: "Older wallets score higher — consistency matters" });
          if (score >= 80)
            tips.push({ text: "Maintain your AAA rating", pts: "Top tier", color: "#00ff88", detail: "Keep graduating tokens and maintaining healthy holder distribution" });
          if (tips.length === 0) return null;
          return (
            <div style={{ padding: 20, borderRadius: 14, border: "1px solid rgba(0,255,136,0.1)", background: "rgba(0,255,136,0.02)", marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(0,255,136,0.5)", textTransform: "uppercase", marginBottom: 14 }}>
                How to improve your score
              </div>
              {tips.map((tip) => (
                <div key={tip.text} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: tip.color, fontSize: 13, lineHeight: 1, marginTop: 2 }}>&#x2191;</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{tip.text}</span>
                      <span style={{ fontSize: 10, color: tip.color, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{tip.pts}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{tip.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
            BAGSPROOF · ON-CHAIN REPUTATION ORACLE
          </div>
          <Link href="/" style={{ fontSize: 11, color: "rgba(0,255,136,0.6)", fontFamily: "'Space Mono', monospace" }}>
            ← bagsproof.sh
          </Link>
        </div>
      </div>
    </div>
  );
}
