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
  params: { id: string };
}

export default async function CreatorProfilePage({
  params,
}: CreatorProfilePageProps) {
  await dbConnect();

  const creator = await getCreatorById(params.id);
  if (!creator) {
    return (
      <div className={styles.container}>
        <h1>Creator not found</h1>
      </div>
    );
  }

  // Count a view
  await incrementView(params.id);

  // Also fetch the user doc by walletAddress to get subscriptionAmount, etc.
  let userDoc: IUser | null = null;
  if (creator.userWalletAddress) {
    userDoc = await findUserByWalletAddress(creator.userWalletAddress);
  }

  // Convert to plain JS objects to pass as props
  const creatorPlain = JSON.parse(JSON.stringify(creator)) as ICreator;
  const userPlain = userDoc
    ? (JSON.parse(JSON.stringify(userDoc)) as IUser)
    : null;

  return (
    <div className={styles.container}>
      <CreatorProfileClient creatorData={creatorPlain} userData={userPlain} />
    </div>
  );
}
