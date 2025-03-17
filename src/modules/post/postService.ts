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
  nftName?: string;
  nftUri?: string;
}): Promise<IPost> {
  const { creatorId, statusText, imageUrl, isGated, price, nftName, nftUri } =
    data;

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
    nftName: nftName || "",
    nftUri: nftUri || "",
  });

  return newPost;
}

/**
 * Update an existing post by postId.
 * If imageUrl is provided, it overwrites the old imageUrl.
 * If imageUrl is undefined, it means no new upload – keep existing.
 */
export async function updatePost(
  postId: string,
  data: {
    statusText: string;
    imageUrl?: string; // if present, replace; if undefined, leave existing
    isGated: boolean;
    price: number;
    nftName?: string;
    nftUri?: string;
  }
): Promise<IPost | null> {
  const post = await Post.findById(postId);
  if (!post) return null;

  // Basic update logic
  post.statusText = data.statusText;
  if (typeof data.imageUrl === "string") {
    post.imageUrl = data.imageUrl;
  }
  post.isGated = data.isGated;
  post.price = data.isGated ? data.price : 0;

  // Update new NFT metadata fields if provided
  if (typeof data.nftName === "string") {
    post.nftName = data.nftName;
  }
  if (typeof data.nftUri === "string") {
    post.nftUri = data.nftUri;
  }

  await post.save();
  return post;
}

/**
 * Get all posts by a given creatorId.
 * Does not filter out gated or not; returns them all.
 * Client can decide which to show based on user.
 */
export async function getPostsByCreatorId(creatorId: string): Promise<IPost[]> {
  return Post.find({ creatorId }).sort({ createdAt: -1 });
}
