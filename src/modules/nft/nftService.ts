import axios from "axios";
import NFT, { INFT } from "./nftModel";

// Removed the old `mintNFT` mock function to avoid confusion.
// We mint NFTs directly on the client side with Metaplex UMI now.

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
