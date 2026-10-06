import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CHIGURU • ಚಿಗುರು | Intelligent Seed & Seedling Monitoring Platform",
  description: "See the seed become a seedling. Low-cost cyber-physical research platform for seed monitoring, cell-level phenotyping, and environmental exposure analysis by Team TerraByte.",
};

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-[#F8FAF6] text-[#1E3A2B] selection:bg-[#52B788]/20 selection:text-[#163828]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
