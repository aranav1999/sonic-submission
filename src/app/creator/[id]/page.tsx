import { dbConnect } from "@/lib/db";
import { getCreatorById } from "@/modules/creator/creatorService";
import { findUserByWalletAddress } from "@/modules/user/userService";
import styles from "./CreatorProfile.module.css";
import { incrementView } from "@/modules/engagement/engagementService";
import { ICreator } from "@/modules/creator/creatorModel";
import { IUser } from "@/modules/user/userModel";
import CreatorProfileClient from "./CreatorProfileClient";

export const dynamic = "force-dynamic";

interface CreatorProfilePageProps {
  // Updated to allow params to be awaited
  params: { id: string } | Promise<{ id: string }>;
}

export default async function CreatorProfilePage({
  params,
}: CreatorProfilePageProps) {
  // Await the params before destructuring its properties
  const { id } = await params;

  // Connect to the database
  await dbConnect();

  // Fetch creator by ID
  const creator = await getCreatorById(id);
  if (!creator) {
    return (
      <div className={styles.container}>
        <h1>Creator not found</h1>
      </div>
    );
  }

  // Count a view for the creator
  await incrementView(id);

  // Fetch the user document by walletAddress (for subscription amount, etc.)
  let userDoc: IUser | null = null;
  if (creator.userWalletAddress) {
    userDoc = await findUserByWalletAddress(creator.userWalletAddress);
  }

  // Convert to plain JS objects for serialization in props
  const creatorPlain = JSON.parse(JSON.stringify(creator)) as ICreator;
  const userPlain = userDoc
    ? (JSON.parse(JSON.stringify(userDoc)) as IUser)
    : null;

  return (
    <div className={styles.container} >
      <CreatorProfileClient creatorData={creatorPlain} userData={userPlain} />
    </div>
  );
}
