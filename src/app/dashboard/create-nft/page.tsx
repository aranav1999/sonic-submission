"use client";

import { useState } from "react";

export default function CreateNFTPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creatorId, setCreatorId] = useState("");

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/nfts/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrl, creatorId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(`Error minting NFT: ${error}`);
        return;
      }
      const data = await res.json();
      alert("NFT minted successfully!");
      console.log(data.nft);
    } catch (err) {
      console.error(err);
      alert("An error occurred while minting NFT");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Mint a New NFT</h2>
      <form onSubmit={handleMint} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label>
          Creator ID
          <input
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
            required
            style={{ display: "block", marginTop: 4 }}
          />
        </label>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ display: "block", marginTop: 4 }}
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", marginTop: 4 }}
          />
        </label>
        <label>
          Image URL
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            style={{ display: "block", marginTop: 4 }}
          />
        </label>
        <button type="submit" style={{ marginTop: 8 }}>
          Mint NFT
        </button>
      </form>
    </div>
  );
}
