import axios from "axios";
import NFT, { INFT } from "./nftModel";

// Placeholder environment variables for Metaplex or your NFT minting service
const METAPLEX_ENDPOINT = process.env.METAPLEX_ENDPOINT || "";
const METAPLEX_API_KEY = process.env.METAPLEX_API_KEY || "";

/**
 * Example function that calls a hypothetical Metaplex endpoint
 * to mint an NFT, then stores the minted NFT in MongoDB.
 */
export async function mintNFT(
  creatorId: string,
  title: string,
  description: string,
  imageUrl: string
): Promise<INFT> {
  // Pseudo-code for calling an NFT minting service:
  // const response = await axios.post(METAPLEX_ENDPOINT, {
  //   apiKey: METAPLEX_API_KEY,
  //   metadata: {
  //     name: title,
  //     description,
  //     image: imageUrl
  //   }
  // });
  // const { mintId, metadataUri } = response.data;

  // For now, mock these:
  const mintId = "mock_mint_id";
  const metadataUri = "mock_metadata_uri";

  const nft = await NFT.create({
    creatorId,
    title,
    description,
    imageUrl,
    metadataUri,
    currentPrice: 1,
    priceHistory: [1],
    blockchainMintId: mintId,
  });

  return nft;
}

export async function getNFTById(nftId: string): Promise<INFT | null> {
  return NFT.findById(nftId);
}

export async function getAllNFTs(): Promise<INFT[]> {
  return NFT.find({});
}

export async function updateNFTPrice(nftId: string, newPrice: number) {
  const nft = await NFT.findById(nftId);
  if (!nft) return null;
  nft.currentPrice = newPrice;
  nft.priceHistory.push(newPrice);
  await nft.save();
  return nft;
}
