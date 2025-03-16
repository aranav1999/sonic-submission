"use client";

import React from "react";
import SolanaWalletProvider from "@/utils/SolanaWalletProvider";

export default function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
