"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Creator Dashboard</h1>
      <p>Welcome to the open dashboard!</p>
      <Link href="/dashboard/create-nft">Mint a New NFT</Link>
    </div>
  );
}
