"use client"; // make sure this is a Client Component

import React, { ReactNode } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// 1) Import the useWallet hook
import { useWallet } from "@solana/wallet-adapter-react";

export default function Layout({ children }: { children: ReactNode }) {
  // 2) Destructure publicKey from useWallet()
  const { publicKey } = useWallet();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <header style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>

          {/* Renders the connect/disconnect button */}
          <WalletMultiButton />

          {/* 3) If publicKey is present, show it; otherwise "Not connected" */}
          {publicKey ? (
            <span style={{ marginLeft: "auto" }}>
              Connected: {publicKey.toBase58()}
            </span>
          ) : (
            <span style={{ marginLeft: "auto" }}>Not connected</span>
          )}
        </nav>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
      <footer style={{ padding: 16, borderTop: "1px solid #ccc" }}>
        <p>© NFT OnlyFans MVP</p>
      </footer>
    </div>
  );
}
