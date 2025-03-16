import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  walletAddress?: string;
  role: "creator" | "subscriber";
  subscriptionAmount?: number; // <-- NEW FIELD
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    walletAddress: { type: String },
    role: { type: String, default: "subscriber" },
    subscriptionAmount: { type: Number, default: 0 }, // <-- NEW FIELD
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);
export default User;
