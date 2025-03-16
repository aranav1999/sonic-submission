import Post, { IPost } from "./postModel";

/**
 * Create a new post entry, including base64 image or external image URL.
 */
export async function createPost(data: {
  creatorId: string;
  statusText: string;
  imageUrl?: string;
  isGated?: boolean;
  price?: number;
}): Promise<IPost> {
  const { creatorId, statusText, imageUrl, isGated, price } = data;

  // Simple validation: if isGated is true, ensure price is provided
  if (isGated && (price === null || price === undefined)) {
    throw new Error("Gated post must have a price.");
  }

  // If post is not gated, override any price with 0
  const finalPrice = isGated ? price || 0 : 0;

  const newPost = await Post.create({
    creatorId,
    statusText,
    imageUrl: imageUrl || "",
    isGated: isGated || false,
    price: finalPrice,
    accessibleBy: [], // start empty
  });

  return newPost;
}

/**
 * Get all posts by a given creatorId.
 * Does not filter out gated or not; returns them all.
 * Client can decide which to show based on user.
 */
export async function getPostsByCreatorId(creatorId: string): Promise<IPost[]> {
  return Post.find({ creatorId }).sort({ createdAt: -1 });
}
