"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";

/**
 * Custom identity plugin for UMI that wraps the connected wallet adapter.
 * This plugin conforms to UMI's expected plugin interface by exposing an install method.
 *
 * @param wallet - The wallet adapter object from @solana/wallet-adapter-react.
 * @returns An object that implements UMI's identity plugin.
 */
function walletAdapterIdentity(wallet: ReturnType<typeof useWallet>) {
  return {
    name: "walletAdapterIdentity",
    install(umi: any) {
      umi.identity = {
        publicKey: wallet.publicKey ?? null,
        signTransaction: wallet.signTransaction
          ? wallet.signTransaction.bind(wallet)
          : async (tx: any) => tx,
        signAllTransactions: wallet.signAllTransactions
          ? wallet.signAllTransactions.bind(wallet)
          : async (txs: any[]) => txs,
      };
    },
  };
}

/**
 * Returns a configured UMI instance pointing to Sonic Devnet,
 * using the currently connected wallet for signing.
 */
export function useMetaplexUmi(rpcUrl?: string) {
  const wallet = useWallet();

  // Use provided RPC if given, otherwise default to Sonic Devnet
  const endpoint = rpcUrl || "https://devnet.sonic.game";
  const umi = createUmi(endpoint);

  // Attach the Metaplex Core plugin
  umi.use(mplCore());

  // If wallet adapter is connected, attach the custom identity plugin
  if (
    wallet.publicKey &&
    wallet.signTransaction &&
    wallet.signAllTransactions
  ) {
    umi.use(walletAdapterIdentity(wallet));
  }

  return umi;
}
