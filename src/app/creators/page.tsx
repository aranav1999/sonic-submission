import Link from "next/link";
import { ICreator } from "@/modules/creator/creatorModel";
import { dbConnect } from "@/lib/db";
import { getAllCreators } from "@/modules/creator/creatorService";
import styles from "./CreatorsPage.module.css";

export const dynamic = "force-dynamic";
// Because we'll fetch data on each load (Next.js 13 recommended if dynamic data changes frequently)

export default async function CreatorsPage() {
  await dbConnect();
  const creators = await getAllCreators();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Discover Creators</h1>
        <p className={styles.subtitle}>
          Explore talented creators sharing their unique digital art and
          collectibles
        </p>
      </div>

      {creators.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            No creators found. Be the first to join our community!
          </p>
          <Link href="/creator-onboarding" className={styles.emptyStateLink}>
            Become a Creator
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {creators.map((creator: ICreator) => (
            <Link
              href={`/creator/${creator._id?.toString()}`}
              key={creator._id?.toString()}
              className={styles.card}
            >
              <div className={styles.imageContainer}>
                {creator.imageUrl ? (
                  <img
                    src={creator.imageUrl}
                    alt={creator.name}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.noImage}>No profile image</div>
                )}
              </div>
              <div className={styles.content}>
                <h2 className={styles.creatorName}>{creator.name}</h2>
                {creator.description && (
                  <p className={styles.description}>{creator.description}</p>
                )}
                <p className={styles.walletAddress}>
                  {creator.userWalletAddress.substring(0, 6)}...
                  {creator.userWalletAddress.substring(
                    creator.userWalletAddress.length - 4
                  )}
                </p>
                <div>
                  {creator.gatingEnabled ? (
                    <span className={`${styles.badge} ${styles.gatedBadge}`}>
                      Token Gated Content
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.nonGatedBadge}`}>
                      Public Content
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
