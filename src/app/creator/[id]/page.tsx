import { dbConnect } from "@/lib/db";
import { getCreatorById } from "@/modules/creator/creatorService";
import styles from "./CreatorProfile.module.css";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  await dbConnect();
  const creator = await getCreatorById(params.id);

  if (!creator) {
    return (
      <div className={styles.container}>
        <h1>Creator not found</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top section with profile info */}
      <div className={styles.profileSection}>
        <div className={styles.profileImageContainer}>
          {creator.imageUrl ? (
            <img
              src={creator.imageUrl}
              alt={creator.name}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.noProfileImage}>No profile image</div>
          )}
        </div>
        
        <div className={styles.profileInfo}>
          <h1 className={styles.creatorName}>{creator.name}</h1>
          {creator.description && (
            <p className={styles.creatorDescription}>{creator.description}</p>
          )}
          <p className={styles.walletAddress}>
            Wallet: {creator.userWalletAddress.substring(0, 6)}...
            {creator.userWalletAddress.substring(
              creator.userWalletAddress.length - 4
            )}
          </p>
        </div>
        
        <div className={styles.subscribeContainer}>
          <button className={styles.subscribeButton}>
            Subscribe for 0.5 SOL
          </button>
        </div>
      </div>

      {/* Bottom section for NFTs */}
      <div className={styles.nftSection}>
        <h2 className={styles.sectionTitle}>Creator's NFTs</h2>
        <div className={styles.nftGrid}>
          {/* This will be populated later with NFT data */}
          <p className={styles.emptyMessage}>No NFTs available yet</p>
        </div>
      </div>
    </div>
  );
}
