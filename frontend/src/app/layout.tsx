import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chiguru • ಚಿಗುರು | Autonomous Smart Agri-CPS",
  description: "Next-Generation Autonomous Agri-Cyber-Physical System & Real-Time Seed Phenotyping Dashboard by Team TerraByte",
};

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
        {children}
      </body>
    </html>
  );
}
