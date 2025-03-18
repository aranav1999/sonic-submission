// src/app/api/creators/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { upsertCreator } from "@/modules/creator/creatorService";
import { uploadImageToIpfs } from "@/lib/ipfsUploadImage";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Ensure client is sending multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const userWalletAddress =
      formData.get("userWalletAddress")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const gatingValue = formData.get("gatingEnabled")?.toString() || "false";
    const gatingEnabled = gatingValue === "true";
    const collectionMint = formData.get("collectionMint")?.toString() || "";

    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      imageUrl = (await uploadImageToIpfs(imageFile, name, description)).ipfsImageUrl;
    }

    // Upsert the creator using the imageUrl from IPFS
    const creator = await upsertCreator({
      userWalletAddress,
      name,
      description,
      imageUrl,
      gatingEnabled,
      collectionMint,
    });

    return NextResponse.json({ creator }, { status: 200 });
  } catch (error: any) {
    console.error("Error uploading image or upserting creator:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
