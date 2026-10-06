import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "epiML — AI Crop Experiment Lab",
  description:
    "One Arduino. Three biological epochs. AI-designed protocols. Deterministic control. Scientist-grade evidence.",
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
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
