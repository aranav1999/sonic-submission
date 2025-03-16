"use client";

import React, { useState } from "react";
import styles from "./TransferNFTForm.module.css";
import { useMetaplexUmi } from "@/utils/useMetaplexUmi";
import { publicKey } from "@metaplex-foundation/umi";
import { transfer } from "@metaplex-foundation/mpl-core";

export default function TransferNFTForm() {
  const umi = useMetaplexUmi();
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!mintAddress || !recipientAddress) {
      alert("Please fill out both fields!");
      return;
    }
    if (!umi.identity || !umi.identity.publicKey) {
      alert("No wallet connected!");
      return;
    }

    setLoading(true);
    setTxSignature(null);

    try {
      const result = await transfer(umi, {
        asset: {
          publicKey: publicKey(mintAddress),
          owner: umi.identity.publicKey,
          oracles: [],
          lifecycleHooks: [],
        },
        newOwner: publicKey(recipientAddress),
      }).sendAndConfirm(umi);

      setTxSignature(result.signature.toString());
      alert("NFT transferred successfully!");
    } catch (err: any) {
      console.error("Transfer failed:", err);
      alert(`Error transferring NFT: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h2>Transfer an NFT</h2>
      <form onSubmit={handleTransfer} className={styles.form}>
        <label>
          NFT Mint Address
          <input
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="NFT mint pubkey..."
            required
          />
        </label>
        <label>
          Recipient Address
          <input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Recipient pubkey..."
            required
          />
        </label>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? "Transferring..." : "Transfer NFT"}
        </button>
      </form>
      {txSignature && (
        <div className={styles.txInfo}>
          <p>Transfer transaction signature:</p>
          <code>{txSignature}</code>
        </div>
      )}
    </div>
  );
}
