"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { initUser } from "@/redux/user/reducer";

export default function Layout({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const dispatch = useDispatch<AppDispatch>();

  // NEW: Dispatch to Redux instead of direct fetch
  useEffect(() => {
    if (publicKey) {
      dispatch(initUser(publicKey.toBase58()));
    }
  }, [publicKey, dispatch]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <header style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/onlyfans">OnlyFans</Link>
          <Link href="/creators">All Creators</Link>
          <Link href="/creator-onboarding">Become a Creator</Link>

          <WalletMultiButton />

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
