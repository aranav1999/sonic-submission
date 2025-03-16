"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Creator Dashboard</h1>
      <p>Welcome to the open dashboard!</p>
      <Link
        href="/dashboard/create-nft"
        style={{ display: "block", marginTop: 12 }}
      >
        Mint a New NFT
      </Link>
      <Link
        href="/dashboard/transfer-nft"
        style={{ display: "block", marginTop: 12 }}
      >
        Transfer an NFT
      </Link>
    </div>
  );
}
