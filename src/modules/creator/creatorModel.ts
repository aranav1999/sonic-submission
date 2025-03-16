import { Schema, model, models, Document } from "mongoose";

export interface ICreator extends Document {
  userWalletAddress: string; // link to user's wallet
  name: string;
  description: string;
  imageUrl: string;
  // Possibly more fields
  gatingEnabled: boolean; // whether certain content is token-gated
}

const CreatorSchema = new Schema<ICreator>(
  {
    userWalletAddress: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    gatingEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Creator = models.Creator || model<ICreator>("Creator", CreatorSchema);
export default Creator;
