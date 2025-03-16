"use client";

import { INFT } from "@/modules/nft/nftModel";
import { useState } from "react";

export default function NFTDetailClient({ nft }: { nft: INFT }) {
  const [likes, setLikes] = useState(0);

  async function handleBuy() {
    // Instead of session checks, 
    // you might check if wallet is connected or just do an open transaction
    try {
      const res = await fetch("/api/nfts/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftId: nft._id,
          sellerId: nft.creatorId,
          price: nft.currentPrice,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(`Error buying NFT: ${error}`);
        return;
      }
      alert("Trade successful!");
    } catch (err) {
      console.error(err);
      alert("Trade failed");
    }
  }

  async function handleLike() {
    try {
      const res = await fetch("/api/engagement/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nftId: nft._id }),
      });
      if (res.ok) {
        setLikes(likes + 1);
      } else {
        alert("Error liking NFT");
      }
    } catch (err) {
      console.error(err);
      alert("Error liking NFT");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{nft.title}</h1>
      <p>{nft.description}</p>
      {nft.imageUrl && (
        <img
          src={nft.imageUrl}
          alt={nft.title}
          style={{ width: 300, height: "auto" }}
        />
      )}
      <p>Current Price: {nft.currentPrice}</p>
      <button onClick={handleBuy}>Buy Now</button>
      <button onClick={handleLike} style={{ marginLeft: 10 }}>
        Like ({likes})
      </button>
    </div>
  );
}
