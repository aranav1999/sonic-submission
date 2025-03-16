import { Schema, model, models, Document } from "mongoose";

export interface INFT extends Document {
  creatorId: string;
  title: string;
  description: string;
  imageUrl: string;
  metadataUri: string;
  currentPrice: number;
  priceHistory: number[];
  blockchainMintId: string;
}

const NFTSchema = new Schema<INFT>(
  {
    creatorId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    metadataUri: { type: String },
    currentPrice: { type: Number, default: 1 },
    priceHistory: [{ type: Number }],
    blockchainMintId: { type: String },
  },
  { timestamps: true }
);

const NFT = models.NFT || model<INFT>("NFT", NFTSchema);
export default NFT;
