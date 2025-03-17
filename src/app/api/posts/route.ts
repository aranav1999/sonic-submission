import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { createPost, getPostsByCreatorId } from "@/modules/post/postService";
import { Buffer } from "buffer";

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
    const nftName = formData.get("nftName")?.toString() || ""; // NEW FIELD
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

    // Convert the image file to base64 as fallback post image
    let imageUrl = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // (A) Optionally upload metadata to IPFS, if there's an image
    //     We'll store the resulting metadataUri in the new "nftUri" field.
    let metadataUri = "";
    if (file) {
      // We'll replicate the logic from ipfs/route.ts for a single-file upload
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Build a formData for the Pump Fun IPFS API
      const ipfsFormData = new FormData();
      const fileName = `post-image-${Date.now()}.png`;
      ipfsFormData.append(
        "file",
        new Blob([fileBuffer], { type: file.type }),
        fileName
      );
      // Provide the NFT name + post text as the "metadata"
      ipfsFormData.append("name", nftName || "Unnamed Post NFT");
      ipfsFormData.append("description", rawStatusText.trim());

      // For clarity, we could also pass a "symbol" if needed:
      // ipfsFormData.append("symbol", "POST");

      // Call Pump Fun IPFS
      const ipfsRes = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: ipfsFormData,
      });
      if (!ipfsRes.ok) {
        throw new Error(
          `Failed to upload to Pump Fun IPFS: ${ipfsRes.statusText}`
        );
      }
      const json = (await ipfsRes.json()) as { metadataUri: string };
      metadataUri = json.metadataUri || "";
    }

    // (B) Create the post with the new fields: nftName, nftUri
    const post = await createPost({
      creatorId,
      statusText: rawStatusText.trim(),
      imageUrl,
      isGated,
      price,
      // Pass them to the DB creation:
      nftName,
      nftUri: metadataUri,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
