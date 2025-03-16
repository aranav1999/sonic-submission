"use client";

import React from "react";
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
  // Removed the mounted check to always wrap children in the provider.
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
