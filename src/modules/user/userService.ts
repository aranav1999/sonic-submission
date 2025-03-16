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
