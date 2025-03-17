/** FILE: src/modules/creator/creatorModel.ts */

import { Schema, model, models, Document } from "mongoose";

export interface ICreator extends Document {
  userWalletAddress: string; // link to user's wallet
  name: string;
  description: string;
  imageUrl: string;
  gatingEnabled: boolean;
  /**
   * NEW FIELD: holds the mint address of the Collection on Solana.
   * If empty, we haven't created a Collection for this creator.
   */
  collectionMint?: string;
}

const CreatorSchema = new Schema<ICreator>(
  {
    userWalletAddress: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    gatingEnabled: { type: Boolean, default: false },
    /**
     * NEW FIELD in the schema
     */
    collectionMint: { type: String, default: "" },
  },
  { timestamps: true }
);

const Creator = models.Creator || model<ICreator>("Creator", CreatorSchema);
export default Creator;
