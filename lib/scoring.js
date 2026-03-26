// ─── SHARED SCORING ENGINE ──────────────────────────────────────────────────

export function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateCreatorProfile(wallet) {
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

export function getTierInfo(totalScore) {
  if (totalScore >= 80)
    return { label: "AAA", color: "#00ff88", bg: "rgba(0,255,136,0.08)" };
  if (totalScore >= 65)
    return { label: "AA", color: "#7fffb0", bg: "rgba(127,255,176,0.08)" };
  if (totalScore >= 50)
    return { label: "A", color: "#f0e060", bg: "rgba(240,224,96,0.08)" };
  if (totalScore >= 35)
    return { label: "BBB", color: "#ffa040", bg: "rgba(255,160,64,0.08)" };
  return { label: "C", color: "#ff4444", bg: "rgba(255,68,68,0.08)" };
}

export function scoreCreator(profile) {
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
  const tier = getTierInfo(totalScore);
  return { score: totalScore, signals, tier, profile };
}

export const DEMO_WALLETS = [
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

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function generateLeaderboard(count = 50) {
  const entries = [];
  for (let i = 0; i < count * 3; i++) {
    const seed = hashCode(`leaderboard-creator-${i}`);
    let wallet = "";
    for (let j = 0; j < 44; j++) {
      wallet += BASE58[(seed * (j + 1) + j * 7 + i * 13) % BASE58.length];
    }
    const profile = generateCreatorProfile(wallet);
    const result = scoreCreator(profile);
    entries.push({ wallet, ...result });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, count).map((e, i) => ({ rank: i + 1, ...e }));
}
