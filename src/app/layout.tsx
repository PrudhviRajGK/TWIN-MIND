import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TwinMind Live Suggestions",
  description: "AI-powered live suggestions during conversations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
