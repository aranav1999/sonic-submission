import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getAllNFTs, updateNFTPrice } from "@/modules/nft/nftService";
import { getEngagement } from "@/modules/engagement/engagementService";
import { getTradesByNFT } from "@/modules/trade/tradeService";
import { calculateNewPrice } from "@/utils/dynamicPricing";
import { INFT } from "@/modules/nft/nftModel";

export async function POST(_: NextRequest) {
  try {
    await dbConnect();
    const allNFTs = await getAllNFTs();

    for (const nft of allNFTs) {
      const nftId = (nft._id as { toString(): string }).toString();
      const eng = await getEngagement(nftId);
      const trades = await getTradesByNFT(nftId);

      const metrics = {
        views: eng?.views || 0,
        likes: eng?.likes || 0,
        recentTrades: trades.length,
      };

      const newPrice = calculateNewPrice(nft, metrics);
      await updateNFTPrice(nftId, newPrice);
    }

    return NextResponse.json(
      { message: "Prices recalculated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
