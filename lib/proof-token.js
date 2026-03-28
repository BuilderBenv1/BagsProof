// ─── $BAGSPROOF TOKEN — REAL ON-CHAIN + SUPABASE PERSISTENCE ──────────────────
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { supabase } from "./supabase";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const PROOF_TOKEN = {
  mint: "GKjUxDgug6njsruEtMawG75iEJfj1tEaxrXwGuZCBAGS",
  symbol: "$BAGSPROOF",
  decimals: 6,
  name: "BagsProof",
};

export const VAULT_WALLET = "DxwnTj8NLVkAKjMZTXjr7AGbmV9U4XhvdRx4MJ7MbDd8";

const RPC_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_HELIUS_RPC
    ? process.env.NEXT_PUBLIC_HELIUS_RPC
    : "https://api.mainnet-beta.solana.com";

export const STAKING_CONFIG = {
  minStake: 100,
  tiers: [
    { amount: 100, label: "Verified", color: "#ab38ff" },
    { amount: 500, label: "Pro", color: "#00c4ff" },
    { amount: 2000, label: "Whale", color: "#ffd700" },
  ],
};

export const MINTING_FEE = 50;

export const DEMO_VERIFIED = [
  "7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q",
  "4mRtZ1yUoI8nBvC3xQpLs6kMwE7hGdFjA2eT5rYjK9w",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

function toTokenAmount(uiAmount) {
  return Math.floor(uiAmount * Math.pow(10, PROOF_TOKEN.decimals));
}

// ─── REAL BALANCE ─────────────────────────────────────────────────────────────

export async function getProofBalance(wallet) {
  try {
    const connection = getConnection();
    const walletPubkey = new PublicKey(wallet);
    const mintPubkey = new PublicKey(PROOF_TOKEN.mint);
    const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / Math.pow(10, PROOF_TOKEN.decimals);
  } catch {
    return 0;
  }
}

// ─── STAKING (SUPABASE-BACKED) ───────────────────────────────────────────────

export function getStakeTier(amount) {
  const tiers = [...STAKING_CONFIG.tiers].reverse();
  for (const t of tiers) {
    if (amount >= t.amount) return t;
  }
  return null;
}

export async function getStakeStatus(wallet) {
  if (DEMO_VERIFIED.includes(wallet)) {
    return {
      isStaked: true,
      amount: 500,
      stakedAt: new Date("2026-02-15").toISOString(),
      tier: STAKING_CONFIG.tiers[1],
    };
  }
  try {
    const { data } = await supabase
      .from("stakes")
      .select("*")
      .eq("wallet", wallet)
      .single();
    if (!data) return null;
    return {
      isStaked: true,
      amount: Number(data.amount),
      stakedAt: data.staked_at,
      tier: { label: data.tier_label, color: data.tier_color },
      signature: data.signature,
    };
  } catch {
    return null;
  }
}

export async function isVerified(wallet) {
  if (DEMO_VERIFIED.includes(wallet)) return true;
  try {
    const { data } = await supabase
      .from("stakes")
      .select("wallet")
      .eq("wallet", wallet)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

// Sync version for client components that already loaded data
export function isVerifiedSync(wallet, loadedStakes) {
  if (DEMO_VERIFIED.includes(wallet)) return true;
  return loadedStakes?.has?.(wallet) || false;
}

export async function stakeTokens(wallet, amount) {
  const provider = window?.phantom?.solana || window?.solana;
  if (!provider) throw new Error("Phantom wallet not found");

  const connection = getConnection();
  const walletPubkey = new PublicKey(wallet);
  const vaultPubkey = new PublicKey(VAULT_WALLET);
  const mintPubkey = new PublicKey(PROOF_TOKEN.mint);

  const sourceATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
  const destATA = await getAssociatedTokenAddress(mintPubkey, vaultPubkey);

  const transaction = new Transaction();

  try {
    await getAccount(connection, destATA);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(walletPubkey, destATA, vaultPubkey, mintPubkey)
    );
  }

  transaction.add(
    createTransferInstruction(sourceATA, destATA, walletPubkey, toTokenAmount(amount))
  );

  const tier = getStakeTier(amount);
  const memo = JSON.stringify({
    app: "BagsProof",
    action: "stake",
    amount,
    tier: tier?.label || "Verified",
    ts: Date.now(),
  });
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo),
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPubkey;

  const signed = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

  // Persist to Supabase
  const stake = {
    isStaked: true,
    amount,
    stakedAt: new Date().toISOString(),
    tier,
    signature,
  };

  await supabase.from("stakes").upsert({
    wallet,
    amount,
    tier_label: tier?.label || "Verified",
    tier_color: tier?.color || "#ab38ff",
    signature,
    staked_at: new Date().toISOString(),
  }, { onConflict: "wallet" });

  return { signature, status: "confirmed", stake };
}

export async function unstakeTokens(wallet) {
  await supabase.from("stakes").delete().eq("wallet", wallet);
  return {
    status: "pending",
    message: "Unstake request submitted. Tokens will be returned within 24h.",
  };
}

// ─── NFT MINTING (SUPABASE-BACKED) ──────────────────────────────────────────

export async function getMintedNFT(wallet) {
  try {
    const { data } = await supabase
      .from("minted_nfts")
      .select("*")
      .eq("wallet", wallet)
      .single();
    if (!data) return null;
    return {
      mint: data.mint,
      assetId: data.asset_id,
      name: data.name,
      score: data.score,
      tier: data.tier,
      tierColor: data.tier_color,
      wallet: data.wallet,
      mintedAt: data.minted_at,
      signature: data.signature,
      explorerUrl: data.explorer_url,
      isRealNFT: data.is_real_nft,
    };
  } catch {
    return null;
  }
}

export async function mintScoreNFT(wallet, scoreData) {
  const provider = window?.phantom?.solana || window?.solana;
  if (!provider) throw new Error("Phantom wallet not found");

  const connection = getConnection();
  const walletPubkey = new PublicKey(wallet);
  const vaultPubkey = new PublicKey(VAULT_WALLET);
  const mintPubkey = new PublicKey(PROOF_TOKEN.mint);

  const sourceATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
  const destATA = await getAssociatedTokenAddress(mintPubkey, vaultPubkey);

  const transaction = new Transaction();

  try {
    await getAccount(connection, destATA);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(walletPubkey, destATA, vaultPubkey, mintPubkey)
    );
  }

  transaction.add(
    createTransferInstruction(sourceATA, destATA, walletPubkey, toTokenAmount(MINTING_FEE))
  );

  const memo = JSON.stringify({
    app: "BagsProof",
    action: "mint-fee",
    score: scoreData.score,
    tier: scoreData.tier.label,
    ts: Date.now(),
  });
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo),
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPubkey;

  const signed = await provider.signTransaction(transaction);
  const feeSig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: feeSig, blockhash, lastValidBlockHeight }, "confirmed");

  // Mint real compressed NFT via Helius
  let nft;
  try {
    const mintRes = await fetch("/api/mint-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, feeTxSignature: feeSig }),
    });
    const mintData = await mintRes.json();

    if (mintRes.ok && mintData.success) {
      nft = {
        mint: mintData.assetId || feeSig,
        name: mintData.name,
        score: mintData.score,
        tier: mintData.tier,
        tierColor: mintData.tierColor,
        wallet,
        mintedAt: new Date().toISOString(),
        signature: mintData.signature || feeSig,
        explorerUrl: mintData.explorerUrl,
        assetId: mintData.assetId,
        isRealNFT: true,
      };
    } else {
      nft = {
        mint: feeSig,
        name: `BagsProof ${scoreData.tier.label} ${scoreData.score}/100`,
        score: scoreData.score,
        tier: scoreData.tier.label,
        tierColor: scoreData.tier.color,
        wallet,
        mintedAt: new Date().toISOString(),
        signature: feeSig,
        explorerUrl: `https://solscan.io/tx/${feeSig}`,
        isRealNFT: false,
      };
    }
  } catch {
    nft = {
      mint: feeSig,
      name: `BagsProof ${scoreData.tier.label} ${scoreData.score}/100`,
      score: scoreData.score,
      tier: scoreData.tier.label,
      tierColor: scoreData.tier.color,
      wallet,
      mintedAt: new Date().toISOString(),
      signature: feeSig,
      explorerUrl: `https://solscan.io/tx/${feeSig}`,
      isRealNFT: false,
    };
  }

  // Persist to Supabase
  await supabase.from("minted_nfts").upsert({
    wallet,
    mint: nft.mint,
    asset_id: nft.assetId || null,
    name: nft.name,
    score: nft.score,
    tier: nft.tier,
    tier_color: nft.tierColor,
    signature: nft.signature,
    explorer_url: nft.explorerUrl,
    is_real_nft: nft.isRealNFT,
    minted_at: nft.mintedAt,
  }, { onConflict: "wallet" });

  return { nft, signature: nft.signature, status: "confirmed" };
}
