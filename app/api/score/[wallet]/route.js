// ─── SCORING ENGINE (shared) ─────────────────────────────────────────────────
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
  const top10HolderPct = rand(20, 95, 7);
  const socialLinked = rand(0, 1, 8) === 1;
  const volumeConsistency = rand(10, 100, 10);
  return {
    wallet,
    totalLaunches,
    graduatedLaunches,
    ruggedLaunches,
    lifetimeFeesSol,
    walletAgeDays,
    top10HolderPct,
    socialLinked,
    volumeConsistency,
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
  };
  const rugRatio =
    profile.totalLaunches > 0
      ? profile.ruggedLaunches / profile.totalLaunches
      : 0;
  signals.rugHistory = {
    label: "Rug History",
    score: Math.round((1 - rugRatio) * 20),
    max: 20,
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
  };
  const ageScore =
    profile.walletAgeDays > 365
      ? 10
      : profile.walletAgeDays > 180
        ? 7
        : profile.walletAgeDays > 60
          ? 4
          : 1;
  signals.walletAge = { label: "Wallet Age", score: ageScore, max: 10 };
  signals.socialVerified = {
    label: "Social Verified",
    score: profile.socialLinked ? 5 : 0,
    max: 5,
  };
  signals.volumeConsistency = {
    label: "Volume Consistency",
    score: Math.round((profile.volumeConsistency / 100) * 10),
    max: 10,
  };
  const totalScore = Object.values(signals).reduce((a, s) => a + s.score, 0);
  const tier =
    totalScore >= 80
      ? "AAA"
      : totalScore >= 65
        ? "AA"
        : totalScore >= 50
          ? "A"
          : totalScore >= 35
            ? "BBB"
            : "C";
  return { score: totalScore, tier, signals, profile };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request, { params }) {
  const { wallet } = await params;
  if (!wallet) {
    return Response.json(
      { error: "Missing wallet address" },
      { status: 400, headers: corsHeaders }
    );
  }
  const profile = generateCreatorProfile(wallet);
  const result = scoreCreator(profile);
  return Response.json(result, { headers: corsHeaders });
}
