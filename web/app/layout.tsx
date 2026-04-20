import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "H12 Hackathon",
  description: "Synaptech work for H12 Hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
