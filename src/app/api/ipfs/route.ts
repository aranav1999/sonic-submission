import { NextRequest, NextResponse } from "next/server";
// import FormData from "form-data";
import { Buffer } from "buffer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    // Optionally, if a symbol is sent from client, use it:
    const symbol = formData.get("symbol")?.toString() || "";

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Convert the uploaded File (a Blob) into a Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Create a new FormData instance from the "form-data" package
    const ipfsFormData = new FormData();
    const fileName = `image-${Date.now()}.png`;
    ipfsFormData.append("file", new Blob([fileBuffer], { type: imageFile.type }), fileName);

    // Append metadata fields using the fields sent by the client
    ipfsFormData.append("name", name);
    ipfsFormData.append("description", description);
    if (symbol) {
      ipfsFormData.append("symbol", symbol);
    }

    // Upload to Pump Fun IPFS API
    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: ipfsFormData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Pump Fun IPFS: ${response.statusText}`);
    }

    const json = (await response.json()) as { metadataUri: string };
    console.log("Metadata URI:", json.metadataUri);
    return NextResponse.json({ metadataUri: json.metadataUri });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
