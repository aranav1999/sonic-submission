import { Schema, model, models, Document } from "mongoose";

/**
 * A post made by a creator. Can be gated or ungated.
 * If gated, a price is required. "accessibleBy" is an array of wallet addresses
 * that have access to this gated content.
 */
export interface IPost extends Document {
  creatorId: string; // ID of the Creator (ObjectId in string form)
  statusText: string; // Up to 50 words
  imageUrl?: string; // Base64 or external link
  isGated: boolean; // If true, requires purchase or special permission
  price?: number; // Required if isGated = true
  accessibleBy: string[]; // Wallet addresses that can view gated content
}

const PostSchema = new Schema<IPost>(
  {
    creatorId: { type: String, required: true },
    statusText: { type: String, required: true },
    imageUrl: { type: String },
    isGated: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    accessibleBy: [{ type: String }], // an array of wallet addresses
  },
  { timestamps: true }
);

const Post = models.Post || model<IPost>("Post", PostSchema);
export default Post;
