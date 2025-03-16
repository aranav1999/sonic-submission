import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { updatePost } from "@/modules/post/postService";

/**
 * PUT /api/posts/[postId]
 * Expects multipart/form-data:
 * - statusText (string) -> up to 50 words
 * - isGated ("true"/"false")
 * - price (string -> number) only if isGated
 * - image (File) optional
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();
    const postId = params.postId;

    // Ensure it's multipart
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
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

    let imageUrl: string | undefined;
    if (file) {
      // Convert file to base64
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const updatedPost = await updatePost(postId, {
      statusText: rawStatusText.trim(),
      imageUrl,
      isGated,
      price,
    });

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post: updatedPost }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
