"use client";

import Link from "next/link";
import { INFT } from "@/modules/nft/nftModel";
import Image from "next/image";
import { useState, useEffect } from "react";
import { compressImage } from "@/utils/imageCompression";

export default function NFTCard({ nft }: { nft: INFT }) {
  const [compressedImageUrl, setCompressedImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAndCompressImage() {
      if (nft.imageUrl) {
        try {
          setIsLoading(true);
          // Compress the image to 400px width with 70% quality
          const compressed = await compressImage(nft.imageUrl, 400, 0.7);
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

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
      }}
    >
      {nft.imageUrl && (
        <div style={{ position: "relative", width: "100%", height: 200 }}>
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
              style={{ objectFit: "cover" }}
              unoptimized
            />
          )}
        </div>
      )}
      <h3>{nft.title}</h3>
      <p>Price: {nft.currentPrice}</p>
      <Link href={`/nft/${nft._id}`}>View Details</Link>
    </div>
  );
}
