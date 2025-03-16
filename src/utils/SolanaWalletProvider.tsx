"use client";

import { ReactNode, useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function SolanaWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Add client-side only rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Sonic Devnet endpoint
  const endpoint = "https://sonic.helius-rpc.com/";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{mounted && children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
