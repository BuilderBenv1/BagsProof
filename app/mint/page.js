"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateCreatorProfile, scoreCreator } from "../../lib/scoring";
import { PROOF_TOKEN, MINTING_FEE, getProofBalance, getMintedNFT, mintScoreNFT } from "../../lib/proof-token";

function NFTPreview({ score, tier, wallet, signals, mintedAt }) {
  const signalList = Object.values(signals);
  return (
    <div style={{
      padding: 24, borderRadius: 16, position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #0d1117 0%, #1a1025 50%, #0d1117 100%)",
      border: "1px solid rgba(171,56,255,0.25)",
      boxShadow: "0 0 40px rgba(171,56,255,0.1), inset 0 0 40px rgba(171,56,255,0.03)",
    }}>
      {/* Holographic shimmer */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none",
        background: "linear-gradient(105deg, transparent 20%, rgba(171,56,255,0.4) 30%, rgba(0,255,136,0.4) 40%, rgba(0,196,255,0.4) 50%, transparent 60%)",
        backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 4 }}>BagsProof Score Credential</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>{wallet.slice(0, 6)}...{wallet.slice(-4)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 5, border: `1px solid ${tier.color}40`, background: tier.bg }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: tier.color }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tier.color, letterSpacing: "0.1em" }}>{tier.label}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 52, fontWeight: 800, color: tier.color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>/100</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {signalList.slice(0, 4).map((s) => {
            const pct = (s.score / s.max) * 100;
            const c = pct >= 80 ? "#00ff88" : pct >= 55 ? "#7fff80" : pct >= 35 ? "#ffd060" : "#ff6644";
            return (
              <div key={s.label} style={{ padding: "6px 8px", borderRadius: 6, background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: c, fontWeight: 700 }}>{s.score}/{s.max}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>
            {mintedAt ? `Minted ${new Date(mintedAt).toLocaleDateString()}` : "Preview"}
          </div>
          <div style={{ fontSize: 9, color: "rgba(171,56,255,0.4)", letterSpacing: "0.1em" }}>SOLANA NFT</div>
        </div>
      </div>
    </div>
  );
}

export default function MintPage() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [scoreResult, setScoreResult] = useState(null);
  const [existingNFT, setExistingNFT] = useState(null);
  const [step, setStep] = useState("idle"); // idle | metadata | uploading | minting | success | error
  const [mintResult, setMintResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = "Mint Score NFT | BagsProof"; }, []);

  const connectWallet = async () => {
    try {
      const provider = window?.phantom?.solana || window?.solana;
      if (!provider?.isPhantom) { window.open("https://phantom.app/", "_blank"); return; }
      const resp = await provider.connect();
      const w = resp.publicKey.toString();
      setWallet(w);
      setBalance(await getProofBalance(w));
      const profile = generateCreatorProfile(w);
      setScoreResult(scoreCreator(profile));
      setExistingNFT(getMintedNFT(w));
    } catch (err) { console.error(err); }
  };

  const handleMint = async () => {
    if (!wallet || !scoreResult) return;
    try {
      setStep("minting");
      const result = await mintScoreNFT(wallet, scoreResult);
      setMintResult(result);
      setBalance(await getProofBalance(wallet));
      setExistingNFT(result.nft);
      setStep("success");
    } catch (err) {
      setError(err.message || "Transaction rejected");
      setStep("error");
    }
  };

  const shareText = mintResult ? encodeURIComponent(
    `Just minted my BagsProof reputation NFT\n\n${scoreResult.tier.label} ${scoreResult.score}/100\n\nMint yours at bagsproof.sh/mint`
  ) : "";

  return (
    <div style={{ minHeight: "100vh", background: "#080b0f", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.85)", position: "relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;800&display=swap'); * { box-sizing: border-box; } a { text-decoration: none; } @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 550, margin: "0 auto", padding: "40px 24px 60px" }}>
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
          Mint <span style={{ color: "#ab38ff" }}>Score NFT</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.6 }}>
          Mint your trust score as an on-chain credential. A verifiable, timestamped proof of your reputation — portable across platforms.
        </p>

        {/* Connect */}
        {!wallet && (
          <div style={{ padding: 32, borderRadius: 14, border: "1px solid rgba(171,56,255,0.15)", background: "rgba(171,56,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>&#127912;</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Connect your wallet to preview and mint your score NFT</p>
            <button onClick={connectWallet} style={{ padding: "12px 28px", borderRadius: 8, background: "linear-gradient(135deg, #ab38ff 0%, #00c4ff 100%)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
              Connect Wallet
            </button>
          </div>
        )}

        {/* Already Minted */}
        {wallet && existingNFT && step !== "success" && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(171,56,255,0.5)", textTransform: "uppercase", marginBottom: 12 }}>Your Score Credential</div>
            <NFTPreview score={existingNFT.score} tier={{ label: existingNFT.tier, color: existingNFT.tierColor, bg: existingNFT.tierColor + "12" }} wallet={wallet} signals={scoreResult?.signals || {}} mintedAt={existingNFT.mintedAt} />
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>NFT MINT ADDRESS</div>
              <a href={existingNFT.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "rgba(171,56,255,0.6)", wordBreak: "break-all" }}>{existingNFT.mint}</a>
            </div>
          </div>
        )}

        {/* Preview + Mint */}
        {wallet && !existingNFT && step === "idle" && scoreResult && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>NFT Preview</div>
            <NFTPreview score={scoreResult.score} tier={scoreResult.tier} wallet={wallet} signals={scoreResult.signals} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", margin: "20px 0" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Minting fee</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{MINTING_FEE} <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{PROOF_TOKEN.symbol}</span></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Your balance</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: balance >= MINTING_FEE ? "rgba(255,255,255,0.7)" : "#ff4444" }}>{balance.toLocaleString()} {PROOF_TOKEN.symbol}</div>
              </div>
            </div>

            <button onClick={handleMint} disabled={balance < MINTING_FEE} style={{
              width: "100%", padding: "16px", borderRadius: 10, border: "none", cursor: balance < MINTING_FEE ? "not-allowed" : "pointer",
              background: balance < MINTING_FEE ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #ab38ff 0%, #00c4ff 100%)",
              color: balance < MINTING_FEE ? "rgba(255,255,255,0.3)" : "#fff",
              fontSize: 15, fontWeight: 700, fontFamily: "'Space Mono', monospace",
            }}>
              {balance < MINTING_FEE ? `Insufficient ${PROOF_TOKEN.symbol}` : "Mint Score NFT"}
            </button>
          </div>
        )}

        {/* Minting progress */}
        {["metadata", "uploading", "minting"].includes(step) && (
          <div style={{ padding: 40, borderRadius: 14, border: "1px solid rgba(171,56,255,0.2)", background: "rgba(171,56,255,0.04)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(171,56,255,0.3)", borderTopColor: "#ab38ff", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ab38ff", marginBottom: 6 }}>
              {step === "metadata" && "Preparing metadata..."}
              {step === "uploading" && "Uploading to Arweave..."}
              {step === "minting" && "Minting on Solana..."}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
              {["metadata", "uploading", "minting"].map((s) => (
                <div key={s} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: step === s ? "#ab38ff" : ["metadata", "uploading", "minting"].indexOf(s) < ["metadata", "uploading", "minting"].indexOf(step) ? "#00ff88" : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {step === "success" && mintResult && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(0,255,136,0.5)", textTransform: "uppercase", marginBottom: 16 }}>Score Credential Minted</div>
            <NFTPreview score={scoreResult.score} tier={scoreResult.tier} wallet={wallet} signals={scoreResult.signals} mintedAt={mintResult.nft.mintedAt} />
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>TRANSACTION</div>
              <a href={`https://solscan.io/tx/${mintResult.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "rgba(0,255,136,0.6)", wordBreak: "break-all" }}>{mintResult.signature.slice(0, 40)}...</a>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", borderRadius: 6, background: "rgba(29,155,240,0.12)", border: "1px solid rgba(29,155,240,0.25)", color: "#1d9bf0", fontSize: 12, fontWeight: 700 }}>Share on X</a>
              <Link href={`/score/${wallet}`} style={{ padding: "10px 20px", borderRadius: 6, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "#00ff88", fontSize: 12, fontWeight: 700 }}>View Score Card</Link>
            </div>
          </div>
        )}

        {step === "error" && (
          <div style={{ padding: 24, borderRadius: 14, border: "1px solid rgba(255,68,68,0.2)", background: "rgba(255,68,68,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#ff4444", marginBottom: 10 }}>{error}</div>
            <button onClick={() => setStep("idle")} style={{ padding: "8px 16px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Try Again</button>
          </div>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>BAGSPROOF · SCORE CREDENTIALS · {PROOF_TOKEN.symbol}</span>
        </div>
      </div>
    </div>
  );
}
