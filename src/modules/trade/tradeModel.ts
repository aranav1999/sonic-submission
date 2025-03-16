import { Schema, model, models, Document } from "mongoose";

export interface ITrade extends Document {
  nftId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  transactionDate: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    nftId: { type: String, required: true },
    buyerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    price: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Trade = models.Trade || model<ITrade>("Trade", TradeSchema);
export default Trade;
