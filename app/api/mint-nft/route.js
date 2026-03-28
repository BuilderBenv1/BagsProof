import { NextResponse } from "next/server";
import { generateCreatorProfile, scoreCreator } from "../../../lib/scoring";

// Helius compressed NFT minting — server-side (needs API key)
export async function POST(request) {
  const { wallet, feeTxSignature } = await request.json();

  if (!wallet || !feeTxSignature) {
    return NextResponse.json({ error: "Missing wallet or feeTxSignature" }, { status: 400 });
  }

  const heliusKey = process.env.HELIUS_API_KEY;
  if (!heliusKey) {
    return NextResponse.json({ error: "Helius API key not configured" }, { status: 500 });
  }

  // Generate the score for metadata
  const profile = generateCreatorProfile(wallet);
  const result = scoreCreator(profile);
  const { score, tier, signals } = result;
  const signalList = Object.values(signals);

  // Build NFT metadata
  const nftName = `BagsProof ${tier.label} ${score}/100`;
  const description = `On-chain reputation credential for ${wallet.slice(0, 8)}...${wallet.slice(-4)}. Trust tier: ${tier.label}, Score: ${score}/100. Verified by BagsProof — the on-chain reputation oracle for Bags.fm creators.`;

  // Use our OG image generator as the NFT image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bagsproof.sh";
  const imageUrl = `${baseUrl}/score/${wallet}/opengraph-image`;
  const externalUrl = `${baseUrl}/score/${wallet}`;

  const attributes = signalList.map((s) => ({
    trait_type: s.label,
    value: s.score,
  }));
  attributes.push(
    { trait_type: "Trust Tier", value: tier.label },
    { trait_type: "Total Score", value: score },
    { trait_type: "Launches", value: profile.totalLaunches },
    { trait_type: "Graduated", value: profile.graduatedLaunches },
    { trait_type: "Fee Tx", value: feeTxSignature },
  );

  try {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "bagsproof-mint",
          method: "mintCompressedNft",
          params: {
            name: nftName,
            symbol: "BPROOF",
            owner: wallet,
            description,
            attributes,
            imageUrl,
            externalUrl,
            sellerFeeBasisPoints: 0,
          },
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      console.error("Helius mint error:", data.error);
      return NextResponse.json(
        { error: "NFT minting failed", detail: data.error.message },
        { status: 500 }
      );
    }

    const { assetId } = data.result || {};
    return NextResponse.json({
      success: true,
      assetId,
      signature: data.result?.signature,
      name: nftName,
      score,
      tier: tier.label,
      tierColor: tier.color,
      wallet,
      imageUrl,
      explorerUrl: assetId
        ? `https://xray.helius.xyz/token/${assetId}`
        : `https://solscan.io/tx/${data.result?.signature}`,
    });
  } catch (err) {
    console.error("Mint API error:", err);
    return NextResponse.json(
      { error: "Minting failed", detail: err.message },
      { status: 500 }
    );
  }
}
