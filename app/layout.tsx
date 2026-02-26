import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/context";
import { FullScreenProvider } from "./fullscreen-context";
import { WeightUnitProvider } from "./weight-unit-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetPat — Dog Ownership Cost Calculator",
  description:
    "Estimate the real cost of owning a dog in the United States. A transparent, data-driven calculator for families and international students.",
  keywords: [
    "dog cost calculator",
    "pet ownership cost",
    "dog expenses USA",
    "pet budget planner",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <WeightUnitProvider>
            <FullScreenProvider>
              <Navbar />
              <div className="min-h-screen">{children}</div>
              <Footer />
            </FullScreenProvider>
          </WeightUnitProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
