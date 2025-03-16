import { dbConnect } from "@/lib/db";
import { getNFTById } from "@/modules/nft/nftService";
import { incrementView } from "@/modules/engagement/engagementService";
import { INFT } from "@/modules/nft/nftModel";
import NFTDetailClient from "./NFTDetailClient";


// This is a "server component" file by default in App Router. We'll fetch data and pass it to a client component.

interface NFTDetailPageProps {
  params: { id: string };
}

export default async function NFTDetailPage({ params }: NFTDetailPageProps) {
  const nftId = params.id;

  // Connect & increment view count on the server side
  await dbConnect();
  await incrementView(nftId);

  // Fetch NFT data
  const nftData = await getNFTById(nftId);
  if (!nftData) {
    return <div style={{ padding: 20 }}>NFT not found</div>;
  }

  // Convert Mongoose doc to plain JS object
  const nftPlain = JSON.parse(JSON.stringify(nftData)) as INFT;

  return <NFTDetailClient nft={nftPlain} />;
}
