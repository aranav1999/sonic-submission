import bcrypt from "bcryptjs";
import User, { IUser } from "./userModel";

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<IUser> {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ username, email, password: hashed });
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function validatePassword(
  user: IUser,
  inputPassword: string
): Promise<boolean> {
  return bcrypt.compare(inputPassword, user.password);
}

/**
 * Find a user by walletAddress
 */
export async function findUserByWalletAddress(
  walletAddress: string
): Promise<IUser | null> {
  return User.findOne({ walletAddress });
}

/**
 * Create a user given a wallet address and a role.
 * Also sets default subscriptionAmount = 0.
 */
export async function createUserWithWallet(
  walletAddress: string,
  role: "creator" | "subscriber" = "subscriber"
): Promise<IUser> {
  return User.create({
    username: `user-${walletAddress.substring(0, 6)}`, // A simple auto-username
    email: `wallet-${walletAddress}@example.com`, // Fake email, optional
    password: "placeholder", // placeholder, not used
    walletAddress,
    role,
    subscriptionAmount: 0, // NEW: defaulting to 0
  });
}
