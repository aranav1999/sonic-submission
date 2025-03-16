import type { Metadata } from "next";
import "./globals.css";
import WalletProviderWrapper from "@/utils/WalletProviderWrapper";
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
        <script
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
        <WalletProviderWrapper>
          <Layout>{children}</Layout>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
