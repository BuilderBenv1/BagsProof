import "./globals.css";

export const metadata = {
  title: "BagsProof",
  description: "On-chain reputation oracle for Bags.fm creators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
