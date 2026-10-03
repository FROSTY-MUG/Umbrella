import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Umbrella OS — Computational Biology Operating System",
  description: "AI-Native Computational Biology Operating System with real-time genomic surveillance and Umbrella Forge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-emerald-900 selection:text-emerald-100">
        {children}
      </body>
    </html>
  );
}
