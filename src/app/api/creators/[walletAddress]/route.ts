import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getCreatorByWallet } from "@/modules/creator/creatorService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    await dbConnect();
    const { walletAddress } = await params;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }
    
    const creator = await getCreatorByWallet(walletAddress);
    if (!creator) {
      // If no creator found, return null
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json(creator, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching creator by wallet:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
