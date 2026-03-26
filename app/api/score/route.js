// app/api/score/route.js
// BagsProof — zero paid dependencies
// .env.local needs: BAGS_API_KEY, HELIUS_API_KEY
// DexScreener needs no key at all

import { NextResponse } from "next/server";

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";
const HELIUS_BASE = "https://api.helius.xyz/v0";
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";

// ─── BAGS ─────────────────────────────────────────────────────────────────────

async function bagsGet(path) {
  const res = await fetch(`${BAGS_BASE}${path}`, {
    headers: { "x-api-key": process.env.BAGS_API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Bags API ${res.status} on ${path}`);
  const data = await res.json();
  return data.response;
}

async function getCreatorTokens(wallet) {
  try {
    const feed = await bagsGet("/token-launch/feed");
    const checks = feed.slice(0, 100).map(async (token) => {
      try {
        const creators = await bagsGet(`/token-launch/creator/v3?tokenMint=${token.tokenMint}`);
        const isCreator = creators?.some((c) => c.wallet === wallet && c.isCreator);
        if (isCreator) return { ...token, creatorData: creators.find((c) => c.isCreator) };
      } catch { return null; }
      return null;
    });
    const results = await Promise.allSettled(checks);
    return results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
  } catch (err) {
    console.error("getCreatorTokens:", err.message);
    return [];
  }
}

async function getTokenFees(tokenMint) {
  try {
    const data = await bagsGet(`/token-launch/lifetime-fees?tokenMint=${tokenMint}`);
    return data?.totalFeesUsd || 0;
  } catch { return 0; }
}

async function getCreatorSocial(tokenMint) {
  try {
    const creators = await bagsGet(`/token-launch/creator/v3?tokenMint=${tokenMint}`);
    const primary = creators?.find((c) => c.isCreator);
    return {
      socialLinked: !!primary?.provider,
      provider: primary?.provider || null,
      providerUsername: primary?.providerUsername || null,
      twitterUsername: primary?.twitterUsername || null,
    };
  } catch { return { socialLinked: false }; }
}

// ─── HELIUS (free tier) ───────────────────────────────────────────────────────

async function getWalletAge(wallet) {
  try {
    const res = await fetch(
      `${HELIUS_BASE}/addresses/${wallet}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=1&type=any&order=asc`
    );
    if (!res.ok) return 0;
    const txns = await res.json();
    if (!txns?.length) return 0;
    return Math.max(0, Math.floor((Math.floor(Date.now() / 1000) - txns[0].timestamp) / 86400));
  } catch (err) {
    console.error("getWalletAge:", err.message);
    return 0;
  }
}

// Helius RPC getTokenLargestAccounts — free, no extra plan
async function getHolderConcentration(tokenMint) {
  try {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: 1,
          method: "getTokenLargestAccounts",
          params: [tokenMint],
        }),
      }
    );
    if (!res.ok) return { top10Pct: 50, holderCount: 0 };
    const data = await res.json();
    const accounts = data?.result?.value || [];
    if (!accounts.length) return { top10Pct: 50, holderCount: 0 };
    const total = accounts.reduce((a, acc) => a + parseFloat(acc.uiAmountString || 0), 0);
    const top10 = accounts.slice(0, 10).reduce((a, acc) => a + parseFloat(acc.uiAmountString || 0), 0);
    return {
      top10Pct: total > 0 ? Math.round((top10 / total) * 100) : 50,
      holderCount: accounts.length,
    };
  } catch (err) {
    console.error("getHolderConcentration:", err.message);
    return { top10Pct: 50, holderCount: 0 };
  }
}

// ─── DEXSCREENER (no key needed) ─────────────────────────────────────────────

async function getVolumeConsistency(tokenMint) {
  try {
    const res = await fetch(`${DEXSCREENER_BASE}/tokens/${tokenMint}`, { next: { revalidate: 300 } });
    if (!res.ok) return 50;
    const data = await res.json();
    const pairs = data?.pairs || [];
    if (!pairs.length) return 20;
    const pair = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    const vol24h = pair?.volume?.h24 || 0;
    const vol6h = pair?.volume?.h6 || 0;
    const vol1h = pair?.volume?.h1 || 0;
    if (vol24h === 0) return 15;
    const h6Ratio = (vol24h / 4) > 0 ? vol6h / (vol24h / 4) : 1;
    const h1Ratio = (vol24h / 24) > 0 ? vol1h / (vol24h / 24) : 1;
    return Math.max(0, Math.min(100, Math.round(100 - Math.abs(h6Ratio - 1) * 20 - Math.abs(h1Ratio - 1) * 10)));
  } catch (err) {
    console.error("getVolumeConsistency:", err.message);
    return 50;
  }
}

// ─── SCORING ──────────────────────────────────────────────────────────────────

function buildScore(signals) {
  const totalScore = Object.values(signals).reduce((a, s) => a + s.score, 0);
  const tier =
    totalScore >= 80 ? { label: "AAA", color: "#00ff88", bg: "rgba(0,255,136,0.08)" }
    : totalScore >= 65 ? { label: "AA", color: "#7fffb0", bg: "rgba(127,255,176,0.08)" }
    : totalScore >= 50 ? { label: "A", color: "#f0e060", bg: "rgba(240,224,96,0.08)" }
    : totalScore >= 35 ? { label: "BBB", color: "#ffa040", bg: "rgba(255,160,64,0.08)" }
    : { label: "C", color: "#ff4444", bg: "rgba(255,68,68,0.08)" };
  return { score: totalScore, tier, signals };
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();

  if (!wallet || wallet.length < 32)
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });

  if (!process.env.BAGS_API_KEY || !process.env.HELIUS_API_KEY)
    return NextResponse.json({ error: "API keys not configured" }, { status: 500 });

  try {
    const [creatorTokens, walletAgeDays] = await Promise.all([
      getCreatorTokens(wallet),
      getWalletAge(wallet),
    ]);

    const totalLaunches = creatorTokens.length;
    const social = totalLaunches > 0
      ? await getCreatorSocial(creatorTokens[0].tokenMint)
      : { socialLinked: false };

    let lifetimeFeesSol = 0, graduatedLaunches = 0, ruggedLaunches = 0;
    let top10HolderPct = 50, holderCount = 0, volumeConsistency = 50;

    if (totalLaunches > 0) {
      const tokenData = await Promise.allSettled(
        creatorTokens.slice(0, 8).map(async (token) => {
          const [fees, holders, volC] = await Promise.allSettled([
            getTokenFees(token.tokenMint),
            getHolderConcentration(token.tokenMint),
            getVolumeConsistency(token.tokenMint),
          ]);
          return {
            fees: fees.status === "fulfilled" ? fees.value : 0,
            isRug: token.status === "PRE_LAUNCH",
            graduated: token.status === "GRADUATED",
            holders: holders.status === "fulfilled" ? holders.value : { top10Pct: 50, holderCount: 0 },
            volC: volC.status === "fulfilled" ? volC.value : 50,
          };
        })
      );

      for (const r of tokenData) {
        if (r.status !== "fulfilled") continue;
        const t = r.value;
        lifetimeFeesSol += t.fees;
        if (t.graduated) graduatedLaunches++;
        if (t.isRug) ruggedLaunches++;
        top10HolderPct = t.holders.top10Pct;
        holderCount = t.holders.holderCount;
        volumeConsistency = t.volC;
      }
    }

    const gradRate = totalLaunches > 0 ? graduatedLaunches / totalLaunches : 0;
    const rugRatio = totalLaunches > 0 ? ruggedLaunches / totalLaunches : 0;

    const signals = {
      graduationRate: {
        label: "Graduation Rate",
        score: Math.round(gradRate * 25), max: 25,
        value: `${graduatedLaunches}/${totalLaunches} tokens`,
        detail: "Tokens that reached graduation vs. total launched",
      },
      rugHistory: {
        label: "Rug History",
        score: Math.round((1 - rugRatio) * 20), max: 20,
        value: ruggedLaunches === 0 ? "Clean" : `${ruggedLaunches} suspected rug${ruggedLaunches > 1 ? "s" : ""}`,
        detail: "Tokens abandoned with no liquidity withdrawal pattern",
      },
      holderDistribution: {
        label: "Holder Distribution",
        score: top10HolderPct < 40 ? 15 : top10HolderPct < 60 ? 10 : top10HolderPct < 80 ? 5 : 0,
        max: 15,
        value: `Top 10 = ${top10HolderPct}%`,
        detail: "Concentration of holdings among top 10 wallets",
      },
      lifetimeFees: {
        label: "Lifetime Fees",
        score: lifetimeFeesSol > 100 ? 15 : lifetimeFeesSol > 20 ? 12 : lifetimeFeesSol > 5 ? 8 : lifetimeFeesSol > 1 ? 4 : totalLaunches > 0 ? 1 : 0,
        max: 15,
        value: `◎ ${lifetimeFeesSol.toFixed(2)} SOL`,
        detail: "Total creator fees earned across all launches",
      },
      walletAge: {
        label: "Wallet Age",
        score: walletAgeDays > 365 ? 10 : walletAgeDays > 180 ? 7 : walletAgeDays > 60 ? 4 : walletAgeDays > 0 ? 1 : 0,
        max: 10,
        value: walletAgeDays > 365
          ? `${Math.floor(walletAgeDays / 365)}y ${Math.floor((walletAgeDays % 365) / 30)}m`
          : walletAgeDays > 0 ? `${Math.floor(walletAgeDays / 30)}m ${walletAgeDays % 30}d`
          : "Unknown",
        detail: "Age of the creator's primary wallet",
      },
      socialVerified: {
        label: "Social Verified",
        score: social.socialLinked ? 5 : 0, max: 5,
        value: social.socialLinked ? `${social.provider} · @${social.providerUsername}` : "No social linked",
        detail: "Verified social identity via Bags provider",
      },
      volumeConsistency: {
        label: "Volume Consistency",
        score: Math.round((volumeConsistency / 100) * 10), max: 10,
        value: volumeConsistency > 70 ? "Sustained" : volumeConsistency > 40 ? "Moderate" : "Spiky",
        detail: "Consistency of trading volume over token lifetime",
      },
    };

    return NextResponse.json({
      wallet,
      ...buildScore(signals),
      profile: {
        wallet, totalLaunches, graduatedLaunches, ruggedLaunches,
        lifetimeFeesSol, walletAgeDays, top10HolderPct, holderCount,
        socialLinked: social.socialLinked,
        twitterUsername: social.twitterUsername,
        volumeConsistency,
      },
      source: "live",
      cachedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("BagsProof score error:", err);
    return NextResponse.json({ error: "Scoring failed", detail: err.message }, { status: 500 });
  }
}
