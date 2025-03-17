/** FILE: src/modules/creator/creatorService.ts */

import Creator, { ICreator } from "./creatorModel";

/**
 * Create or update a Creator entry.
 * If userWalletAddress already exists, update fields; else create new.
 */
export async function upsertCreator(data: {
  userWalletAddress: string;
  name: string;
  description?: string;
  imageUrl?: string;
  gatingEnabled?: boolean;
  collectionMint?: string;
}): Promise<ICreator> {
  const {
    userWalletAddress,
    name,
    description,
    imageUrl,
    gatingEnabled,
    collectionMint,
  } = data;

  let creator = await Creator.findOne({ userWalletAddress });
  if (!creator) {
    // Create new creator
    creator = await Creator.create({
      userWalletAddress,
      name,
      description,
      imageUrl,
      gatingEnabled: gatingEnabled || false,
      collectionMint: collectionMint || "",
    });
  } else {
    // Update existing
    creator.name = name;
    creator.description = description || "";
    if (imageUrl !== "") {
      creator.imageUrl = imageUrl;
    }
    if (gatingEnabled !== undefined) {
      creator.gatingEnabled = gatingEnabled;
    }
    // NEW: update the collectionMint if provided
    if (collectionMint) {
      creator.collectionMint = collectionMint;
    }
    await creator.save();
  }

  return creator;
}

/**
 * Return all creators.
 */
export async function getAllCreators(): Promise<ICreator[]> {
  return Creator.find({}).sort({ createdAt: -1 });
}

/**
 * Return one creator by wallet address.
 */
export async function getCreatorByWallet(
  userWalletAddress: string
): Promise<ICreator | null> {
  return Creator.findOne({ userWalletAddress });
}

/**
 * Return one creator by ID.
 */
export async function getCreatorById(id: string): Promise<ICreator | null> {
  return Creator.findById(id);
}
