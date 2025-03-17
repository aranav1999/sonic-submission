import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import Layout from "@/components/Layout";
import { Tektur } from "next/font/google";

// Initialize the Tektur font
const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-tektur", // Add variable name for CSS usage
});

export const metadata: Metadata = {
  title: "FanPit",
  description: "Now with Solana wallet authentication!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${tektur.variable} ${tektur.className}`}>
      <head>
        <Script
          id="crypto-polyfill"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !globalThis.nodeCrypto) {
                globalThis.nodeCrypto = window.crypto;
              }
            `,
          }}
        />
      </head>
      <body className={tektur.className}>
        {/* 
          We wrap Providers, and inside Providers we place our Layout 
          to ensure the Wallet context is available before Layout uses it.
        */}
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
