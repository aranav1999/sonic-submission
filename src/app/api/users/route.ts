import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import {
  findUserByWalletAddress,
  createUserWithWallet,
} from "@/modules/user/userService";

/**
 * POST /api/users
 * Expects: { walletAddress: string }
 * If user with this wallet already exists, returns it.
 * Otherwise, creates a new user with default role "subscriber".
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Missing walletAddress in request body" },
        { status: 400 }
      );
    }

    // Check if user already exists by wallet
    let user = await findUserByWalletAddress(walletAddress);
    if (!user) {
      // Create a new user with default role
      user = await createUserWithWallet(walletAddress, "subscriber");
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating/finding user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
