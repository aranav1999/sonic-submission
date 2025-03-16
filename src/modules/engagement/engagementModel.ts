import { Schema, model, models, Document } from "mongoose";

export interface IEngagement extends Document {
  nftId: string;
  views: number;
  likes: number;
}

const EngagementSchema = new Schema<IEngagement>(
  {
    nftId: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Engagement = models.Engagement || model<IEngagement>("Engagement", EngagementSchema);
export default Engagement;
