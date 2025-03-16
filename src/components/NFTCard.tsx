"use client";

import Link from "next/link";
import { INFT } from "@/modules/nft/nftModel";

export default function NFTCard({ nft }: { nft: INFT }) {
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
        <img
          src={nft.imageUrl}
          alt={nft.title}
          style={{ width: "100%", height: "auto" }}
        />
      )}
      <h3>{nft.title}</h3>
      <p>Price: {nft.currentPrice}</p>
      <Link href={`/nft/${nft._id}`}>View Details</Link>
    </div>
  );
}
