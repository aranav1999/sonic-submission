"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the SolanaWalletProvider with no SSR
const SolanaWalletProvider = dynamic(
  () => import("@/utils/SolanaWalletProvider"),
  { ssr: false }
);

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
