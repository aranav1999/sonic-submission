"use client";

import React, { useState } from "react";
import styles from "./OnlyFans.module.css";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMetaplexUmi } from "@/utils/useMetaplexUmi";
import { generateSigner } from "@metaplex-foundation/umi";
import { create } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";

export default function OnlyFansPage() {
  const { publicKey: userPubKey, sendTransaction } = useWallet();
  const umi = useMetaplexUmi(); // our custom Umi instance from the updated file

  // For tipping
  const [tipFeedback, setTipFeedback] = useState<string | null>(null);

  // For minting an NFT
  const [nftTitle, setNftTitle] = useState("");
  const [nftUri, setNftUri] = useState("");
  const [mintFeedback, setMintFeedback] = useState<string | null>(null);

  // Example mock data of "creators"
  const creators = [
    {
      name: "Alice",
      imageUrl:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&q=60",
      publicKey: "BkKJSVa8NfMbZ5JBMSXTf5afmmNHyRp9QBy8n6bD5BRU", // example
    },
    {
      name: "Bob",
      imageUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=500&q=60",
      publicKey: "EprCRkAvzpnMod8CE4vMg7bzXhvYZ1DhY4Ar72rSgVXf", // example
    },
  ];

  // --------------------------
  // 1) One-click tipping logic
  // --------------------------
  const connection = new Connection("https://devnet.sonic.game", "confirmed");

  async function handleTip(creatorPkString: string) {
    try {
      if (!userPubKey) {
        alert("Wallet not connected!");
        return;
      }

      setTipFeedback(null);
      const creatorPubKey = new PublicKey(creatorPkString);

      // Build a simple SystemProgram transfer transaction
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPubKey,
          toPubkey: creatorPubKey,
          lamports: 0.1 * LAMPORTS_PER_SOL, // 0.1 SOL tip
        })
      );

      // Send the transaction with the connection
      const signature = await sendTransaction(tx, connection);

      setTipFeedback(`Tip transaction sent! Tx Signature: ${signature}`);
    } catch (error: any) {
      console.error("Tip error:", error);
      setTipFeedback(`Error sending tip: ${error.message}`);
    }
  }


  // --------------------------------------------------
  // 2) "Mint NFT for X SOL to chat" demonstration
  // --------------------------------------------------
  async function handleMintNft(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!userPubKey) {
        alert("Wallet not connected!");
        return;
      }
      if (!nftTitle || !nftUri) {
        alert("Please fill out both Title and URI");
        return;
      }
      setMintFeedback(null);

      // 1) Create a new NFT asset signer
      const assetSigner = generateSigner(umi);

      // 2) We call the basic 'create' from @metaplex-foundation/mpl-core
      //    This is an example. In a real app, you might want advanced
      //    collection logic, rule sets, etc.
      const createBuilder = create(umi, {
        asset: assetSigner,
        name: nftTitle,
        uri: nftUri,
        owner: publicKey(userPubKey),
      });

      const tx = await createBuilder.sendAndConfirm(umi);

      setMintFeedback(
        `NFT minted successfully! \nMint Address: ${assetSigner.publicKey}\nTx Sig: ${tx.signature}`
      );
    } catch (error: any) {
      console.error("Mint NFT error:", error);
      setMintFeedback(`Error minting NFT: ${error.message}`);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>OnlyFans-like Platform</h1>
      <p>
        Welcome to the OnlyFans MVP. Connect your wallet to tip creators or mint
        an NFT for special access to their time!
      </p>

      {/* CREATOR LIST + TIP UI */}
      <h2 className={styles.sectionTitle}>Creators</h2>
      <div className={styles.creatorList}>
        {creators.map((creator) => (
          <div key={creator.publicKey} className={styles.creatorCard}>
            <img src={creator.imageUrl} alt={creator.name} />
            <div className={styles.nameRow}>
              <strong>{creator.name}</strong>
            </div>
            <button
              className={styles.tipButton}
              onClick={() => handleTip(creator.publicKey)}
            >
              Tip 0.1 SOL
            </button>
          </div>
        ))}
      </div>

      {tipFeedback && <div className={styles.message}>{tipFeedback}</div>}

      {/* MINT NFT UI */}
      <h2 className={styles.sectionTitle}>Mint NFT for X SOL to Chat</h2>
      <div className={styles.mintSection}>
        <form onSubmit={handleMintNft}>
          <div className={styles.formRow}>
            <label htmlFor="nftTitle">NFT Title</label>
            <input
              type="text"
              id="nftTitle"
              value={nftTitle}
              onChange={(e) => setNftTitle(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="nftUri">URI (image link or JSON metadata)</label>
            <input
              type="text"
              id="nftUri"
              value={nftUri}
              onChange={(e) => setNftUri(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Mint NFT
          </button>
        </form>

        {mintFeedback && <div className={styles.message}>{mintFeedback}</div>}
      </div>
    </div>
  );
}
