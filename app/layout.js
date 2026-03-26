import "./globals.css";

export const metadata = {
  title: "BagsProof — On-chain Reputation Oracle for Bags.fm Creators",
  description:
    "Paste any creator wallet or @handle and get a composite 0-100 trust score across 7 signals. Know who you're trading before you trade.",
  metadataBase: new URL("https://bagsproof.sh"),
  openGraph: {
    title: "BagsProof — Creator Trust Scores",
    description:
      "On-chain reputation oracle for Bags.fm creators. 7 signals. Composite trust score. No guesswork.",
    siteName: "BagsProof",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BagsProof",
    description: "On-chain reputation oracle for Bags.fm creators",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  themeColor: "#080b0f",
};

export const viewport = {
  themeColor: "#080b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
