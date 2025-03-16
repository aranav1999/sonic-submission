import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { createTrade } from "@/modules/trade/tradeService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nftId, sellerId, buyerId, price } = body;

    await dbConnect();
    const trade = await createTrade(nftId, buyerId, sellerId, price);

    return NextResponse.json({ trade }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
