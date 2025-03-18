// src/lib/ipfsUploadImage.ts
import fs from "fs";
import path from "path";
import os from "os";
import FormData from "form-data";
import sharp from "sharp";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);

export async function uploadImageToIpfs(
  imageFile: File,
  name: string,
  description: string,
  symbol?: string
): Promise<{ metadataUri: string; ipfsImageUrl: string }> {
  // Convert the uploaded file to a Buffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Compress the image using sharp (resize to a max width of 1024 and output as JPEG at 80% quality)
  const outputFormat = "jpeg";
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 1024, withoutEnlargement: true })
    .toFormat(outputFormat, { quality: 80 })
    .toBuffer();

  // Write the compressed image to a temporary file
  const tempFileName = `image-${Date.now()}.${outputFormat}`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);
  await fs.promises.writeFile(tempFilePath, compressedBuffer);

  // Prepare metadata for the IPFS upload
  const metadata = {
    name: name || "Uploaded Image",
    symbol: symbol || "",
    description: description || "",
    showName: false,
  };

  // Create a FormData instance and append the file stream and metadata
  const formData = new FormData();
  formData.append("file", fs.createReadStream(tempFilePath), {
    filename: tempFileName,
    contentType: "image/jpeg",
  });
  formData.append("name", metadata.name);
  formData.append("symbol", metadata.symbol);
  formData.append("description", metadata.description);
  formData.append("showName", metadata.showName.toString());

  // Upload to Pump Fun IPFS API
  const { default: fetch } = await import("node-fetch");
  const ipfsResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
  });
  if (!ipfsResponse.ok) {
    await unlinkAsync(tempFilePath);
    throw new Error(
      `Failed to upload to Pump Fun IPFS: ${ipfsResponse.statusText}`
    );
  }
  const ipfsResult = (await ipfsResponse.json()) as { metadataUri: string };
  const metadataUri = ipfsResult.metadataUri;
  if (!metadataUri) {
    await unlinkAsync(tempFilePath);
    throw new Error("No metadataUri returned from IPFS upload.");
  }

  // Clean up the temporary file
  await unlinkAsync(tempFilePath);

  // Fetch the metadata JSON from the returned URI to extract the image URL
  let ipfsImageUrl = metadataUri;
  try {
    const metadataFetchResponse = await fetch(metadataUri);
    if (metadataFetchResponse.ok) {
      const metadataJson = await metadataFetchResponse.json() as { image?: string };
      if (metadataJson.image) {
        ipfsImageUrl = metadataJson.image;
      }
    }
  } catch (err) {
    console.error("Error fetching metadata JSON from IPFS:", err);
  }

  return {metadataUri , ipfsImageUrl};
}
