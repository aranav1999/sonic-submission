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

/**
 * PUT /api/users
 * Expects JSON: { walletAddress: string, subscriptionAmount?: number }
 * Updates the user's subscriptionAmount (or other fields if needed).
 */
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { walletAddress, subscriptionAmount } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Missing walletAddress in request body" },
        { status: 400 }
      );
    }

    const user = await findUserByWalletAddress(walletAddress);
    if (!user) {
      return NextResponse.json(
        { error: "User not found for given walletAddress" },
        { status: 404 }
      );
    }

    // Update subscriptionAmount if provided
    if (typeof subscriptionAmount === "number") {
      user.subscriptionAmount = subscriptionAmount;
    }

    await user.save();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
