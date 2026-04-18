import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Healing Gabès — Environmental RSE Analytics",
  description:
    "Environmental RSE broker platform for the Gabès industrial zone. AI-powered pollution monitoring, company RSE scoring, and actionable sustainability recommendations.",
  keywords: ["Gabès", "pollution", "RSE", "CSR", "environment", "Tunisia", "AI", "sustainability"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased dark`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
