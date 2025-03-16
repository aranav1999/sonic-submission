import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { incrementLike } from "@/modules/engagement/engagementService";

export async function POST(req: NextRequest) {
  try {
    const { nftId } = await req.json();
    await dbConnect();
    await incrementLike(nftId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
