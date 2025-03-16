import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { mintNFT } from "@/modules/nft/nftService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, creatorId } = body;

    await dbConnect();
    const nft = await mintNFT(creatorId, title, description, imageUrl);

    return NextResponse.json({ nft }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
