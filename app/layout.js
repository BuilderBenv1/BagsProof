import "./globals.css";

export const metadata = {
  title: "Bags Creator Trust Score",
  description: "On-chain reputation oracle for Bags.fm creators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
