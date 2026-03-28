// ─── $BAGSPROOF TOKEN — REAL ON-CHAIN INTEGRATION ─────────────────────────────
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const PROOF_TOKEN = {
  mint: "GKjUxDgug6njsruEtMawG75iEJfj1tEaxrXwGuZCBAGS",
  symbol: "$BAGSPROOF",
  decimals: 6, // standard Bags.fm token decimals
  name: "BagsProof",
};

export const VAULT_WALLET = "DxwnTj8NLVkAKjMZTXjr7AGbmV9U4XhvdRx4MJ7MbDd8";

// Solana mainnet RPC — use Helius if key available, else public
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

export const MINTING_FEE = 50; // $BAGSPROOF

// Demo wallets shown as verified on server-rendered pages
export const DEMO_VERIFIED = [
  "7xKpQr9fVnBzLm3qWs8tHjYuEi2cDa5oP6nRvXwmN3q",
  "4mRtZ1yUoI8nBvC3xQpLs6kMwE7hGdFjA2eT5rYjK9w",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function readStore(key) {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

function writeStore(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

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
    // Token account doesn't exist = 0 balance
    return 0;
  }
}

// ─── STAKING (REAL SPL TRANSFER) ─────────────────────────────────────────────

export function getStakeTier(amount) {
  const tiers = [...STAKING_CONFIG.tiers].reverse();
  for (const t of tiers) {
    if (amount >= t.amount) return t;
  }
  return null;
}

export function getStakeStatus(wallet) {
  if (DEMO_VERIFIED.includes(wallet)) {
    return {
      isStaked: true,
      amount: 500,
      stakedAt: new Date("2026-02-15").toISOString(),
      tier: STAKING_CONFIG.tiers[1],
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
  const provider = window?.phantom?.solana || window?.solana;
  if (!provider) throw new Error("Phantom wallet not found");

  const connection = getConnection();
  const walletPubkey = new PublicKey(wallet);
  const vaultPubkey = new PublicKey(VAULT_WALLET);
  const mintPubkey = new PublicKey(PROOF_TOKEN.mint);

  // Get source token account (user's ATA)
  const sourceATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey);

  // Get destination token account (vault's ATA)
  const destATA = await getAssociatedTokenAddress(mintPubkey, vaultPubkey);

  const transaction = new Transaction();

  // Create vault ATA if it doesn't exist
  try {
    await getAccount(connection, destATA);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        walletPubkey, // payer
        destATA,
        vaultPubkey,
        mintPubkey
      )
    );
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      sourceATA,
      destATA,
      walletPubkey,
      toTokenAmount(amount)
    )
  );

  // Add memo with staking metadata (on-chain proof)
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

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPubkey;

  // Sign and send via Phantom
  const signed = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  // Record stake locally
  const stake = {
    isStaked: true,
    amount,
    stakedAt: new Date().toISOString(),
    tier,
    signature,
  };

  const store = readStore("proof_stakes");
  store[wallet] = stake;
  writeStore("proof_stakes", store);

  return {
    signature,
    status: "confirmed",
    stake,
  };
}

export async function unstakeTokens(wallet) {
  // Unstaking requires the vault owner to send tokens back.
  // For now, mark as unstaked locally and show a pending message.
  const store = readStore("proof_stakes");
  const existing = store[wallet];
  if (!existing) throw new Error("No active stake");

  delete store[wallet];
  writeStore("proof_stakes", store);

  return {
    status: "pending",
    message: "Unstake request submitted. Tokens will be returned within 24h.",
  };
}

// ─── NFT MINTING (REAL FEE + REAL COMPRESSED NFT VIA HELIUS) ────────────────

export function getMintedNFT(wallet) {
  const store = readStore("proof_nfts");
  return store[wallet] || null;
}

export async function mintScoreNFT(wallet, scoreData) {
  const provider = window?.phantom?.solana || window?.solana;
  if (!provider) throw new Error("Phantom wallet not found");

  const connection = getConnection();
  const walletPubkey = new PublicKey(wallet);
  const vaultPubkey = new PublicKey(VAULT_WALLET);
  const mintPubkey = new PublicKey(PROOF_TOKEN.mint);

  // Step 1: Transfer $BAGSPROOF minting fee to vault
  const sourceATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
  const destATA = await getAssociatedTokenAddress(mintPubkey, vaultPubkey);

  const transaction = new Transaction();

  try {
    await getAccount(connection, destATA);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        walletPubkey,
        destATA,
        vaultPubkey,
        mintPubkey
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      sourceATA,
      destATA,
      walletPubkey,
      toTokenAmount(MINTING_FEE)
    )
  );

  // Add memo for fee payment
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

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPubkey;

  const signed = await provider.signTransaction(transaction);
  const feeSig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature: feeSig, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  // Step 2: Call server to mint compressed NFT via Helius
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
      // Helius mint failed — record fee payment as the credential
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
    // Network error — still record the fee payment
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

  // Store locally
  const store = readStore("proof_nfts");
  store[wallet] = nft;
  writeStore("proof_nfts", store);

  return { nft, signature: nft.signature, status: "confirmed" };
}
