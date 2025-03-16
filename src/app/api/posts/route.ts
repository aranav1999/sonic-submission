import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { createPost, getPostsByCreatorId } from "@/modules/post/postService";

/**
 * GET /api/posts?creatorId=xxxx
 * Returns an array of posts for the specified creator.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        { error: "creatorId query parameter is required" },
        { status: 400 }
      );
    }

    const posts = await getPostsByCreatorId(creatorId);
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching posts by creatorId:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Expects multipart/form-data:
 * - creatorId (string)
 * - statusText (string) -> up to 50 words
 * - isGated ("true"/"false")
 * - price (string -> number)
 * - image (File) optional
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // We need to ensure it's multipart
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const creatorId = formData.get("creatorId")?.toString() || "";
    const rawStatusText = formData.get("statusText")?.toString() || "";
    const isGatedVal = formData.get("isGated")?.toString() || "false";
    const priceVal = formData.get("price")?.toString() || "";
    const file = formData.get("image") as File | null;

    // Basic max 50 words check
    const wordCount = rawStatusText.trim().split(/\s+/).length;
    if (wordCount > 50) {
      return NextResponse.json(
        { error: "statusText cannot exceed 50 words." },
        { status: 400 }
      );
    }

    // Convert gating
    const isGated = isGatedVal === "true";
    let price = 0;
    if (isGated && priceVal) {
      price = parseFloat(priceVal);
      if (Number.isNaN(price)) {
        return NextResponse.json(
          { error: "Invalid price for gated post" },
          { status: 400 }
        );
      }
    }

    let imageUrl = "";
    if (file) {
      // Convert file to base64
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const post = await createPost({
      creatorId,
      statusText: rawStatusText.trim(),
      imageUrl,
      isGated,
      price,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
