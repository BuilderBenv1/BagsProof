# BagsProof

**On-chain reputation oracle for Bags.fm creators.**

Paste any creator wallet and get a composite 0–100 trust score across 7 signals. Know who you're trading before you trade.

🔗 [bagsproof.sh](https://bagsproof.sh) · Built for the [Bags Hackathon](https://bags.fm/hackathon)

---

## The Problem

Every token on Bags.fm looks the same at launch. You see a name, a ticker, some chat hype — but zero information about the person behind it. Serial ruggers can abandon a token and relaunch under a new ticker tomorrow. Per-token analysis tools don't catch this. BagsProof does.

## How It Works

BagsProof scores the **creator wallet**, not the token. By aggregating a creator's entire history across Bags.fm, BagsProof surfaces patterns that single-token tools miss.

### 7 Scoring Signals (100 points total)

| Signal | Max | Source |
|---|---|---|
| Graduation Rate | 25 | Bags `/token-launch/feed` |
| Rug History | 20 | Bags analytics |
| Holder Distribution | 15 | Birdeye `token/holders` |
| Lifetime Fees | 15 | Bags `/lifetime-fees` |
| Wallet Age | 10 | Helius `getAssetsByOwner` |
| Volume Consistency | 10 | Birdeye |
| Social Verified | 5 | Bags `/creator/v3` provider field |

### Trust Tiers

| Score | Tier |
|---|---|
| 80–100 | AAA |
| 65–79 | AA |
| 50–64 | A |
| 35–49 | BBB |
| 0–34 | C |

---

## Stack

- **Next.js** — frontend
- **Bags API** — creator identity, lifetime fees, launch history
- **Helius** — wallet age via `getAssetsByOwner`
- **Birdeye** — holder distribution and volume data
- **Solana** — all scores are derived from onchain data

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The demo runs on deterministic mock data generated from wallet address hashes — no API keys required to explore the UI. To connect real data, add your keys to `.env.local`:

```
BAGS_API_KEY=your_key
HELIUS_API_KEY=your_key
BIRDEYE_API_KEY=your_key
```

---

## Why BagsProof

The same scoring architecture powers [AgentProof](https://agentproof.sh) — a live reputation oracle indexing 51,700+ AI agents across 22 chains. BagsProof applies that methodology to the Bags creator economy: composite signals, verifiable onchain, no guesswork.

---

## Bags Hackathon

Category: **Bags API**  
Contact: help@punthub.co.uk · [@BuilderBenv1](https://x.com/BuilderBenv1)
