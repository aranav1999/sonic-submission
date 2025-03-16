import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "NFT OnlyFans MVP",
  description: "Now with Solana wallet authentication!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
      <body>
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
