import { NextResponse } from "next/server";
import { hashCode } from "../../../lib/scoring";

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";

async function bagsGet(path) {
  const res = await fetch(`${BAGS_BASE}${path}`, {
    headers: { "x-api-key": process.env.BAGS_API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Bags API ${res.status} on ${path}`);
  const data = await res.json();
  return data.response;
}

async function resolveHandleLive(handle) {
  const feed = await bagsGet("/token-launch/feed");
  for (const token of feed.slice(0, 200)) {
    try {
      const creators = await bagsGet(
        `/token-launch/creator/v3?tokenMint=${token.tokenMint}`
      );
      const match = creators?.find(
        (c) =>
          c.isCreator &&
          (c.twitterUsername?.toLowerCase() === handle ||
            c.providerUsername?.toLowerCase() === handle)
      );
      if (match) return { wallet: match.wallet, handle, tokenMint: token.tokenMint };
    } catch {
      continue;
    }
  }
  return null;
}

// Deterministic mock: hash the handle to produce a fake but consistent wallet
function resolveHandleMock(handle) {
  const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const seed = hashCode(handle);
  let wallet = "";
  for (let i = 0; i < 44; i++) {
    wallet += BASE58[(seed * (i + 1) + i * 7) % BASE58.length];
  }
  return { wallet, handle, mock: true };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("handle")?.trim();

  if (!raw)
    return NextResponse.json({ error: "Missing ?handle= param" }, { status: 400 });

  const handle = raw.replace(/^@/, "").toLowerCase();

  if (!handle || handle.length < 1)
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });

  // Try live Bags API first
  if (process.env.BAGS_API_KEY) {
    try {
      const result = await resolveHandleLive(handle);
      if (result)
        return NextResponse.json({ ...result, source: "live" });
    } catch (err) {
      console.error("Handle lookup live error:", err.message);
    }
  }

  // Fall back to deterministic mock
  const mock = resolveHandleMock(handle);
  return NextResponse.json({ ...mock, source: "mock" });
}
