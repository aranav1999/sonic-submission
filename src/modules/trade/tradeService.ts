import Trade, { ITrade } from "./tradeModel";
import { updateNFTPrice } from "../nft/nftService";

export async function createTrade(
  nftId: string,
  buyerId: string,
  sellerId: string,
  price: number
): Promise<ITrade> {
  // Record the trade
  const trade = await Trade.create({
    nftId,
    buyerId,
    sellerId,
    price,
  });
  // Update the NFT's current price
  await updateNFTPrice(nftId, price);
  return trade;
}

export async function getTradesByNFT(nftId: string): Promise<ITrade[]> {
  return Trade.find({ nftId });
}
