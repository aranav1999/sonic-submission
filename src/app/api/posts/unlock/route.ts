// File: src/app/api/posts/unlock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Post from "@/modules/post/postModel";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { postId, userWallet } = await req.json();

    if (!postId || !userWallet) {
      return NextResponse.json(
        { error: "Missing postId or userWallet in request body" },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Add the user to the accessibleBy array if not already included
    if (!post.accessibleBy.includes(userWallet)) {
      post.accessibleBy.push(userWallet);
      await post.save();
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error: any) {
    console.error("Error unlocking post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
