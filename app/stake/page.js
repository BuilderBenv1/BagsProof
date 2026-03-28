"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateCreatorProfile, scoreCreator } from "../../lib/scoring";
import {
  PROOF_TOKEN, STAKING_CONFIG, getProofBalance,
  getStakeStatus, stakeTokens, unstakeTokens, getStakeTier,
} from "../../lib/proof-token";

export default function StakePage() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [stakeStatus, setStakeStatus] = useState(null);
  const [step, setStep] = useState("idle"); // idle | confirming | staking | success | error
  const [txSig, setTxSig] = useState(null);
  const [error, setError] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    document.title = "Stake $BAGSPROOF | BagsProof";
  }, []);

  const connectWallet = async () => {
    try {
      const provider = window?.phantom?.solana || window?.solana;
      if (!provider?.isPhantom) { window.open("https://phantom.app/", "_blank"); return; }
      const resp = await provider.connect();
      const w = resp.publicKey.toString();
      setWallet(w);
      setBalance(await getProofBalance(w));
      setStakeStatus(getStakeStatus(w));
      const profile = generateCreatorProfile(w);
      setScoreResult(scoreCreator(profile));
    } catch (err) { console.error(err); }
  };

  const handleStake = async () => {
    if (!wallet) return;
    setStep("staking");
    try {
      const result = await stakeTokens(wallet, stakeAmount);
      setTxSig(result.signature);
      setStakeStatus(result.stake);
      setBalance(await getProofBalance(wallet));
      setStep("success");
    } catch (err) {
      setError(err.message || "Transaction rejected");
      setStep("error");
    }
  };

  const handleUnstake = async () => {
    if (!wallet) return;
    setStep("staking");
    try {
      await unstakeTokens(wallet);
      setStakeStatus(null);
      setBalance(await getProofBalance(wallet));
      setStep("idle");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  };

  const selectedTier = getStakeTier(stakeAmount);

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } a { text-decoration: none; } @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: "linear-gradient(135deg, #00ff88 0%, #00c4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,136,0.3)" }}>
              <span style={{ fontSize: 16 }}>&#9672;</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>BagsProof</span>
          </Link>
          <Link href="/" style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>← Home</Link>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", margin: "0 0 8px" }}>
          Stake <span style={{ color: "#ab38ff" }}>{PROOF_TOKEN.symbol}</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.6 }}>
          Stake tokens to verify your creator profile. Verified creators get a trust badge on their score card, visible to everyone checking their reputation.
        </p>

        {/* Connect Wallet */}
        {!wallet && (
          <div style={{ padding: 32, borderRadius: 14, border: "1px solid rgba(171,56,255,0.15)", background: "rgba(171,56,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#128737;</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Connect your Phantom wallet to stake {PROOF_TOKEN.symbol}</p>
            <button onClick={connectWallet} style={{ padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #ab38ff 0%, #00c4ff 100%)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
              Connect Wallet
            </button>
          </div>
        )}

        {/* Already Staked */}
        {wallet && stakeStatus && stakeStatus.isStaked && step !== "success" && (
          <div style={{ padding: 24, borderRadius: 14, border: `1px solid ${stakeStatus.tier?.color || "#ab38ff"}30`, background: `${stakeStatus.tier?.color || "#ab38ff"}08` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>&#9989;</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: stakeStatus.tier?.color || "#ab38ff" }}>Profile Verified</span>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Staked</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{stakeStatus.amount} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{PROOF_TOKEN.symbol}</span></div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Tier</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: stakeStatus.tier?.color || "#ab38ff" }}>{stakeStatus.tier?.label || "Verified"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Since</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{new Date(stakeStatus.stakedAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/score/${wallet}`} style={{ flex: 1, textAlign: "center", padding: "10px 16px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00ff88", fontSize: 12, fontWeight: 700 }}>View Score Card</Link>
              <button onClick={handleUnstake} style={{ padding: "10px 16px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Unstake</button>
            </div>
          </div>
        )}

        {/* Staking Flow */}
        {wallet && (!stakeStatus || !stakeStatus.isStaked) && step === "idle" && (
          <>
            {/* Balance */}
            <div style={{ padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Your Balance</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{balance.toLocaleString()} <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{PROOF_TOKEN.symbol}</span></div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace" }}>{wallet.slice(0, 4)}...{wallet.slice(-4)}</div>
              </div>
            </div>

            {/* Tier Selection */}
            <div style={{ padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 14 }}>Select staking tier</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {STAKING_CONFIG.tiers.map((tier) => {
                  const selected = stakeAmount === tier.amount;
                  return (
                    <button key={tier.amount} onClick={() => setStakeAmount(tier.amount)} style={{
                      flex: 1, minWidth: 120, padding: "14px 12px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${selected ? tier.color + "60" : "rgba(255,255,255,0.08)"}`,
                      background: selected ? tier.color + "12" : "rgba(255,255,255,0.02)",
                      transition: "all 0.2s", fontFamily: "'Space Mono', monospace",
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: selected ? tier.color : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{tier.amount}</div>
                      <div style={{ fontSize: 10, color: selected ? tier.color : "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{tier.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {scoreResult && (
              <div style={{ padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Your score preview</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: scoreResult.tier.color }}>{scoreResult.score}</span>
                  <span style={{ fontSize: 11, color: scoreResult.tier.color, padding: "2px 8px", borderRadius: 4, border: `1px solid ${scoreResult.tier.color}40`, background: scoreResult.tier.bg }}>{scoreResult.tier.label}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>+</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: selectedTier?.color || "#ab38ff", padding: "2px 8px", borderRadius: 4, border: `1px solid ${selectedTier?.color || "#ab38ff"}40`, background: `${selectedTier?.color || "#ab38ff"}12` }}>
                    &#128737; {selectedTier?.label || "Verified"}
                  </span>
                </div>
              </div>
            )}

            {/* Stake Button */}
            <button onClick={handleStake} disabled={balance < stakeAmount} style={{
              width: "100%", padding: "16px", borderRadius: 10, border: "none", cursor: balance < stakeAmount ? "not-allowed" : "pointer",
              background: balance < stakeAmount ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${selectedTier?.color || "#ab38ff"} 0%, #00c4ff 100%)`,
              color: balance < stakeAmount ? "rgba(255,255,255,0.3)" : "#fff",
              fontSize: 15, fontWeight: 700, fontFamily: "'Space Mono', monospace",
            }}>
              {balance < stakeAmount ? `Insufficient ${PROOF_TOKEN.symbol}` : `Stake ${stakeAmount} ${PROOF_TOKEN.symbol}`}
            </button>
          </>
        )}

        {/* Confirming */}
        {step === "confirming" && (
          <div style={{ padding: 40, borderRadius: 14, border: "1px solid rgba(171,56,255,0.2)", background: "rgba(171,56,255,0.04)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(171,56,255,0.3)", borderTopColor: "#ab38ff", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ab38ff", marginBottom: 6 }}>Confirm in Phantom</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Approve the staking transaction in your wallet...</div>
          </div>
        )}

        {/* Staking in progress */}
        {step === "staking" && (
          <div style={{ padding: 40, borderRadius: 14, border: "1px solid rgba(0,255,136,0.15)", background: "rgba(0,255,136,0.03)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(0,255,136,0.3)", borderTopColor: "#00ff88", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00ff88", marginBottom: 6 }}>Processing on Solana</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Confirming transaction...</div>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div style={{ padding: 32, borderRadius: 14, border: `1px solid ${stakeStatus?.tier?.color || "#00ff88"}30`, background: `${stakeStatus?.tier?.color || "#00ff88"}08`, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#128737;</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: stakeStatus?.tier?.color || "#00ff88", marginBottom: 6 }}>Profile Verified!</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Staked {stakeStatus?.amount} {PROOF_TOKEN.symbol} · {stakeStatus?.tier?.label} tier
            </div>
            {txSig && (
              <div style={{ padding: 10, borderRadius: 6, background: "rgba(0,0,0,0.2)", marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>TRANSACTION</div>
                <a href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "rgba(0,255,136,0.6)", wordBreak: "break-all" }}>
                  {txSig.slice(0, 32)}...
                </a>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href={`/score/${wallet}`} style={{ padding: "10px 20px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00ff88", fontSize: 12, fontWeight: 700 }}>View Score Card</Link>
              <Link href="/mint" style={{ padding: "10px 20px", borderRadius: 6, background: "rgba(171,56,255,0.1)", border: "1px solid rgba(171,56,255,0.25)", color: "#ab38ff", fontSize: 12, fontWeight: 700 }}>Mint Score NFT</Link>
            </div>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div style={{ padding: 24, borderRadius: 14, border: "1px solid rgba(255,68,68,0.2)", background: "rgba(255,68,68,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#ff4444", marginBottom: 10 }}>{error}</div>
            <button onClick={() => setStep("idle")} style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Try Again</button>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>BAGSPROOF · STAKE-TO-VERIFY · {PROOF_TOKEN.symbol}</span>
        </div>
      </div>
    </div>
  );
}
