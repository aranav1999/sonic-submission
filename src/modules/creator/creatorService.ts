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
}): Promise<ICreator> {
  const { userWalletAddress, name, description, imageUrl, gatingEnabled } =
    data;

  let creator = await Creator.findOne({ userWalletAddress });
  if (!creator) {
    creator = await Creator.create({
      userWalletAddress,
      name,
      description,
      imageUrl,
      gatingEnabled: gatingEnabled || false,
    });
  } else {
    // Update existing: preserve existing imageUrl if no new one is provided
    creator.name = name;
    creator.description = description || "";
    creator.imageUrl = imageUrl !== "" ? imageUrl : creator.imageUrl;
    if (gatingEnabled !== undefined) {
      creator.gatingEnabled = gatingEnabled;
    }
    await creator.save();
  }

  return creator;
}

/**
 * Return all creators.
 */
export async function getAllCreators(): Promise<ICreator[]> {
  return Creator.find({}).sort({ createdAt: -1 }); // Sort by newest first
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
