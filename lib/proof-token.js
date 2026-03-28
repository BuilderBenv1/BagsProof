// ─── $PROOF TOKEN MOCK ENGINE ─────────────────────────────────────────────────
// Realistic mock for hackathon demo — localStorage-backed, no Solana deps

export const PROOF_TOKEN = {
  mint: "PRFxBagsProof1111111111111111111111111111111",
  symbol: "$PROOF",
  decimals: 9,
  name: "BagsProof Token",
};

export const STAKING_CONFIG = {
  minStake: 100,
  tiers: [
    { amount: 100, label: "Verified", color: "#ab38ff" },
    { amount: 500, label: "Pro", color: "#00c4ff" },
    { amount: 2000, label: "Whale", color: "#ffd700" },
  ],
};

export const MINTING_FEE = 50; // $PROOF

// Demo wallets that are pre-verified (for server components / OG images)
export const DEMO_VERIFIED = [
  "7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q",
  "4mRtZ1yUoI8nBvC3xQpLs6kMwE7hGdFjA2eT5rYjK9w",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function mockSignature(seed) {
  const h = hashCode(seed + Date.now());
  let sig = "";
  for (let i = 0; i < 88; i++) sig += BASE58[(h * (i + 1) + i * 13) % BASE58.length];
  return sig;
}

function readStore(key) {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

function writeStore(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── BALANCE ──────────────────────────────────────────────────────────────────

export function getProofBalance(wallet) {
  const store = readStore("proof_balances");
  if (store[wallet] !== undefined) return store[wallet];
  // Deterministic starting balance: 500–5000 $PROOF
  return 500 + (hashCode(wallet) % 4500);
}

function setProofBalance(wallet, amount) {
  const store = readStore("proof_balances");
  store[wallet] = Math.max(0, amount);
  writeStore("proof_balances", store);
}

// ─── STAKING ──────────────────────────────────────────────────────────────────

export function getStakeTier(amount) {
  const tiers = [...STAKING_CONFIG.tiers].reverse();
  for (const t of tiers) {
    if (amount >= t.amount) return t;
  }
  return null;
}

export function getStakeStatus(wallet) {
  // Check demo wallets first
  if (DEMO_VERIFIED.includes(wallet)) {
    return {
      isStaked: true,
      amount: 500,
      stakedAt: new Date("2026-02-15").toISOString(),
      tier: STAKING_CONFIG.tiers[1], // Pro
    };
  }
  const store = readStore("proof_stakes");
  return store[wallet] || null;
}

export function isVerified(wallet) {
  const status = getStakeStatus(wallet);
  return !!(status && status.isStaked);
}

export async function stakeTokens(wallet, amount) {
  // Simulate transaction delay
  await new Promise((r) => setTimeout(r, 2200));

  const balance = getProofBalance(wallet);
  if (balance < amount) throw new Error("Insufficient $PROOF balance");

  setProofBalance(wallet, balance - amount);

  const tier = getStakeTier(amount);
  const stake = {
    isStaked: true,
    amount,
    stakedAt: new Date().toISOString(),
    tier,
  };

  const store = readStore("proof_stakes");
  store[wallet] = stake;
  writeStore("proof_stakes", store);

  return {
    signature: mockSignature(wallet + "stake"),
    slot: 250000000 + (hashCode(wallet) % 1000000),
    blockTime: Math.floor(Date.now() / 1000),
    status: "confirmed",
    stake,
  };
}

export async function unstakeTokens(wallet) {
  await new Promise((r) => setTimeout(r, 1800));

  const store = readStore("proof_stakes");
  const existing = store[wallet];
  if (!existing) throw new Error("No active stake");

  const balance = getProofBalance(wallet);
  setProofBalance(wallet, balance + existing.amount);

  delete store[wallet];
  writeStore("proof_stakes", store);

  return {
    signature: mockSignature(wallet + "unstake"),
    slot: 250000000 + (hashCode(wallet) % 1000000) + 1,
    blockTime: Math.floor(Date.now() / 1000),
    status: "confirmed",
  };
}

// ─── NFT MINTING ──────────────────────────────────────────────────────────────

export function getMintedNFT(wallet) {
  const store = readStore("proof_nfts");
  return store[wallet] || null;
}

export async function mintScoreNFT(wallet, scoreData) {
  // Step 1: metadata
  await new Promise((r) => setTimeout(r, 1000));
  // Step 2: upload
  await new Promise((r) => setTimeout(r, 1200));
  // Step 3: mint
  await new Promise((r) => setTimeout(r, 1500));

  const balance = getProofBalance(wallet);
  if (balance < MINTING_FEE) throw new Error("Insufficient $PROOF for minting fee");

  setProofBalance(wallet, balance - MINTING_FEE);

  const nftMint = "NFT" + mockSignature(wallet + "nft").slice(0, 41);
  const nft = {
    mint: nftMint,
    name: `BagsProof Score #${(hashCode(wallet) % 9000) + 1000}`,
    score: scoreData.score,
    tier: scoreData.tier.label,
    tierColor: scoreData.tier.color,
    wallet,
    mintedAt: new Date().toISOString(),
    signals: Object.fromEntries(
      Object.entries(scoreData.signals).map(([k, v]) => [k, { score: v.score, max: v.max }])
    ),
    explorerUrl: `https://solscan.io/token/${nftMint}?cluster=devnet`,
  };

  const store = readStore("proof_nfts");
  store[wallet] = nft;
  writeStore("proof_nfts", store);

  return {
    nft,
    signature: mockSignature(wallet + "mint"),
    slot: 250000000 + (hashCode(wallet) % 1000000) + 2,
    status: "confirmed",
  };
}
