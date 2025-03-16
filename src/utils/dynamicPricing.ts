import { INFT } from "@/modules/nft/nftModel";

interface EngagementMetrics {
  views: number;
  likes: number;
  recentTrades: number;
}

export function calculateNewPrice(nft: INFT, metrics: EngagementMetrics): number {
  let base = nft.currentPrice;

  // Simple formula: add multipliers based on engagement
  const likeMultiplier = 1 + 0.05 * metrics.likes;  // +5% per like
  const viewMultiplier = 1 + 0.01 * metrics.views;  // +1% per view
  const tradeMultiplier = 1 + 0.1 * metrics.recentTrades; // +10% per recent trade

  const newPrice = base * likeMultiplier * viewMultiplier * tradeMultiplier;
  return parseFloat(newPrice.toFixed(2));
}
