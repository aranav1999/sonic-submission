import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";

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
          We now defer all client-side hooks (Redux, wallet, 
          and your Layout component) to the Providers client component.
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
