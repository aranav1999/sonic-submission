"use client";

import React, { useState } from "react";
import styles from "./CreateNFTForm.module.css";
import { useMetaplexUmi } from "@/utils/useMetaplexUmi";
import { generateSigner } from "@metaplex-foundation/umi";
import { create } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";

/**
 * A client component providing a UI to mint an NFT on Sonic using Metaplex.
 */
export default function CreateNFTForm() {
  const umi = useMetaplexUmi();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Please enter a Title and Image URL!");
      return;
    }
    if (!umi.identity || !umi.identity.publicKey) {
      alert("No wallet connected!");
      return;
    }

    setLoading(true);
    setTxSignature(null);

    try {
      const assetSigner = generateSigner(umi);

      // For simplicity, we store the description in the "uri" or a pointer
      const finalUri = imageUrl;

      const tx = await create(umi, {
        asset: assetSigner,
        name: title,
        uri: finalUri,
        owner: publicKey(umi.identity.publicKey),
      }).sendAndConfirm(umi);

      setTxSignature(tx.signature.toString());
      alert("NFT minted successfully!");
    } catch (error: any) {
      console.error("Minting error:", error);
      alert("Error minting NFT: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h2>Mint a New NFT on Sonic</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Title
          <input
            type="text"
            placeholder="My Cool NFT"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            placeholder="Describe your NFT"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          Image URL
          <input
            type="text"
            placeholder="https://example.com/image.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </label>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>

      {txSignature && (
        <div className={styles.txInfo}>
          <p>Mint transaction signature:</p>
          <code>{txSignature}</code>
        </div>
      )}
    </div>
  );
}
