"use client";

import { INFT } from "@/modules/nft/nftModel";
import { useState, useEffect } from "react";
import Image from "next/image";
import { compressImage } from "@/utils/imageCompression";

export default function NFTDetailClient({ nft }: { nft: INFT }) {
  const [likes, setLikes] = useState(0);
  const [compressedImageUrl, setCompressedImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAndCompressImage() {
      if (nft.imageUrl) {
        try {
          setIsLoading(true);
          // Compress the image to 800px width with 80% quality for detail view
          const compressed = await compressImage(nft.imageUrl, 800, 0.8);
          setCompressedImageUrl(compressed);
        } catch (error) {
          console.error("Error compressing image:", error);
          // Fallback to original image if compression fails
          setCompressedImageUrl(nft.imageUrl);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadAndCompressImage();
  }, [nft.imageUrl]);

  async function handleBuy() {
    // Existing buy logic
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
    // Existing like logic
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
        <div style={{ position: 'relative', width: 300, height: 300 }}>
          {isLoading ? (
            <div style={{ 
              width: "100%", 
              height: "100%", 
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              Loading...
            </div>
          ) : (
            <Image
              src={compressedImageUrl || nft.imageUrl}
              alt={nft.title}
              fill
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          )}
        </div>
      )}
      <p>Current Price: {nft.currentPrice}</p>
      <button onClick={handleBuy}>Buy Now</button>
      <button onClick={handleLike} style={{ marginLeft: 10 }}>
        Like ({likes})
      </button>
    </div>
  );
}
