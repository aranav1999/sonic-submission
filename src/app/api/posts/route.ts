// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { createPost, getPostsByCreatorId } from "@/modules/post/postService";
import { uploadImageToIpfs } from "@/lib/ipfsUploadImage";

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
 * - nftName (string) -> the desired NFT name
 * - image (File) optional
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Ensure it's multipart/form-data
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
    const nftName = formData.get("nftName")?.toString() || "";
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

    let finMetadataUri = "";
    let imageUrl = "";
    if (file) {
      const { metadataUri, ipfsImageUrl } = await uploadImageToIpfs(
        file,
        nftName || "Unnamed Post NFT",
        rawStatusText.trim()
      );
      finMetadataUri = metadataUri;
      imageUrl = ipfsImageUrl;
    }

    // Create the post with the IPFS image URL used for both imageUrl and nftUri
    const post = await createPost({
      creatorId,
      statusText: rawStatusText.trim(),
      imageUrl,
      isGated,
      price,
      nftName,
      nftUri: finMetadataUri, // use the same IPFS URL
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
