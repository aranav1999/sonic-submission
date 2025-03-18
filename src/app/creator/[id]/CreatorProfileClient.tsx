"use client";

import React, { useState, useEffect } from "react";
import { ICreator } from "@/modules/creator/creatorModel";
import { IUser } from "@/modules/user/userModel";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import Image from "next/image";
import {
  create,
  mplCore,
  fetchCollection,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  generateSigner,
  publicKey as umiPubKey,
} from "@metaplex-foundation/umi";

/** ------------------------------
 *   POST INTERFACE (client-side)
 *  ------------------------------ */
interface IPost {
  _id: string;
  creatorId: string;
  statusText: string;
  imageUrl?: string;
  isGated: boolean;
  price?: number;
  accessibleBy: string[];
  nftName?: string;
  nftUri?: string;
}

/** ------------------------------
 *   CREATE POST MODAL
 *  ------------------------------ */
function CreatePostModal({
  onClose,
  creatorId,
  onPostCreated,
}: {
  onClose: () => void;
  creatorId: string;
  onPostCreated: (post: IPost) => void;
}) {
  const [statusText, setStatusText] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [price, setPrice] = useState<number>(0);

  // NEW: Let the user provide an NFT Name
  const [nftName, setNftName] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Local preview only:
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append("creatorId", creatorId);
      formData.append("statusText", statusText);
      formData.append("isGated", isGated ? "true" : "false");
      if (isGated) {
        formData.append("price", price.toString());
      }
      // NEW: Send the NFT name
      formData.append("nftName", nftName);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }
      const { post } = await res.json();

      // Notify parent
      onPostCreated(post);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e211c]/95 via-[#0b0f0f]/95 to-[#0e1f1a]/95 p-6 shadow-2xl backdrop-blur-sm border border-[#0a0f0f]/30">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00ce88] opacity-5 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full"></div>

        <h2 className="text-xl font-bold text-white mb-5">Create New Post</h2>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {/* POST TEXT */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Post Text (max 50 words)
            </label>
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
              required
            />
          </div>

          {/* NFT NAME FIELD */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              NFT Name
            </label>
            <input
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder="e.g. 'Super Exclusive Post #1'"
              className="w-full px-4 py-2 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white"
              required
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Upload Image (optional)
            </label>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-[#16f195]/30 mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  width={400}
                  height={160}
                  unoptimized // For base64 data URLs
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#00ce88]/20 file:text-[#00ce88] hover:file:bg-[#00ce88]/30 cursor-pointer"
            />
          </div>

          {/* GATED CHECKBOX + PRICE */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isGated"
              checked={isGated}
              onChange={(e) => setIsGated(e.target.checked)}
              className="w-4 h-4 text-[#00ce88] bg-[#0e211c] border-[#0a0f0f] rounded focus:ring-[#00ce88]/50"
            />
            <label
              htmlFor="isGated"
              className="ml-2 text-sm font-medium text-gray-300"
            >
              Is Gated?
            </label>
          </div>
          {isGated && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Price (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
                required
              />
            </div>
          )}

          {error && (
            <div className="px-4 py-2 bg-red-600/10 border border-red-600/25 text-red-300 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg bg-[#0e211c] text-gray-300 font-medium border border-[#0a0f0f] hover:bg-[#0a0f0f] transition-colors duration-200"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00ce88] to-[#49bf58] text-[#0e1f1a] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0e1f1a]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </div>
                ) : (
                  "Create Post"
                )}
              </span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** ------------------------------
 *   EDIT POST MODAL
 *  ------------------------------ */
function EditPostModal({
  onClose,
  post,
  onPostUpdated,
}: {
  onClose: () => void;
  post: IPost;
  onPostUpdated: (updated: IPost) => void;
}) {
  const [statusText, setStatusText] = useState(post.statusText);
  const [isGated, setIsGated] = useState(post.isGated);
  const [price, setPrice] = useState<number>(post.price || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(post.imageUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append("statusText", statusText);
      formData.append("isGated", isGated ? "true" : "false");
      if (isGated) {
        formData.append("price", price.toString());
      }
      // Only send image if changed
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update post");
      }
      const { post: updatedPost } = await res.json();
      onPostUpdated(updatedPost);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e211c]/95 via-[#0b0f0f]/95 to-[#0e1f1a]/95 p-6 shadow-2xl backdrop-blur-sm border border-[#0a0f0f]/30">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00ce88] opacity-5 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full"></div>

        <h2 className="text-xl font-bold text-white mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          Edit Post
        </h2>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Post Text (max 50 words)
            </label>
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Update Image (optional)
            </label>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-[#16f195]/30 mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  width={400}
                  height={160}
                  unoptimized // For base64 data URLs
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#00ce88]/20 file:text-[#00ce88] hover:file:bg-[#00ce88]/30 cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isGatedEdit"
              checked={isGated}
              onChange={(e) => setIsGated(e.target.checked)}
              className="w-4 h-4 text-[#00ce88] bg-[#0e211c] border-[#0a0f0f] rounded focus:ring-[#00ce88]/50"
            />
            <label
              htmlFor="isGatedEdit"
              className="ml-2 text-sm font-medium text-gray-300"
            >
              Is Gated?
            </label>
          </div>

          {isGated && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Price (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
                required
              />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg bg-[#0e211c] text-gray-300 font-medium border border-[#0a0f0f] hover:bg-[#0a0f0f] transition-colors duration-200"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00ce88] to-[#49bf58] text-[#0e1f1a] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? "Updating..." : "Save Changes"}
              </span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** --------------------------------
 *   MINT GATED NFT (optional usage)
 *  -------------------------------- */
async function mintGatedNFT(
  rpcEndpoint: string,
  walletAdapter: {
    publicKey: PublicKey | null;
    signTransaction?: (tx: any) => Promise<any>;
    sendTransaction?: (tx: any) => Promise<any>;
  },
  collectionMint: string | null,
  name: string,
  uri: string
): Promise<string> {
  if (!walletAdapter.publicKey) {
    throw new Error("No connected wallet to mint NFT.");
  }
  if (!walletAdapter.signTransaction) {
    throw new Error("This wallet does not support signTransaction.");
  }
  if (!walletAdapter.sendTransaction) {
    throw new Error("This wallet does not support sendTransaction.");
  }

  // Example metaPDA address (for advanced use cases):
  const [updateAuthorityPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("collection_update_authority")],
    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
  );

  // Create a Umi instance configured with the user's wallet adapter.
  const umi = createUmi(rpcEndpoint)
    .use(mplCore())
    .use(walletAdapterIdentity(walletAdapter));

  // Convert the collectionMint to a Umi publicKey if provided
  let collection = null;
  if (collectionMint) {
    collection = await fetchCollection(
      umi,
      fromWeb3JsPublicKey(new PublicKey(collectionMint))
    );
  }
  console.log("Collection:", collection);

  // 1) Generate a new "asset" signer for the NFT
  const nftAsset = generateSigner(umi);

  // 2) Build the create instruction
  const createBuilder = create(umi, {
    asset: nftAsset,
    collection: collection || undefined,
    name,
    uri,
    plugins: [
      {
        type: "UpdateDelegate",
        authority: {
          type: "Address",
          address: fromWeb3JsPublicKey(updateAuthorityPDA),
        },
        additionalDelegates: [],
      },
      {
        type: "TransferDelegate",
        authority: {
          type: "Address",
          address: fromWeb3JsPublicKey(updateAuthorityPDA),
        },
      },
      {
        type: "Royalties",
        basisPoints: 500,
        creators: [
          {
            address: fromWeb3JsPublicKey(updateAuthorityPDA),
            percentage: 100,
          },
        ],
        ruleSet: ruleSet("None"),
      },
    ],
  });

  // 3) Send and confirm the transaction
  const tx = await createBuilder.sendAndConfirm(umi);
  console.log("NFT minted Transaction ID:", tx.signature.toString());

  // Return the minted NFT address as a web3.js string
  return toWeb3JsPublicKey(nftAsset.publicKey).toBase58();
}

/** --------------------------------------
 *   CREATOR PROFILE CLIENT MAIN COMPONENT
 *  -------------------------------------- */
export default function CreatorProfileClient({
  creatorData,
  userData,
}: {
  creatorData: ICreator;
  userData: IUser | null;
}) {
  const { publicKey, sendTransaction, signTransaction, wallet } = useWallet();
  const [isEditing, setIsEditing] = useState(false);

  // We’ll toggle which RPC endpoint to use:
  const getRpcEndpoint = () => {
    return process.env.NEXT_PUBLIC_SONIC_RPC_ENDPOINT || "";
  };

  // Local state for editing profile
  const [name, setName] = useState(creatorData.name || "");
  const [description, setDescription] = useState(creatorData.description || "");
  const [imageUrl, setImageUrl] = useState(creatorData.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gatingEnabled, setGatingEnabled] = useState(
    creatorData.gatingEnabled || false
  );
  const [subscriptionAmount, setSubscriptionAmount] = useState<number>(
    userData?.subscriptionAmount || 0
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for posts
  const [posts, setPosts] = useState<IPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State for editing a single post
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postBeingEdited, setPostBeingEdited] = useState<IPost | null>(null);

  // Purchase states & messages
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");

  // Check if the connected wallet is the creator’s wallet
  const canEdit =
    publicKey && publicKey.toBase58() === creatorData.userWalletAddress;

  // Fetch posts on mount (or when creator changes)
  useEffect(() => {
    async function fetchPosts() {
      if (creatorData._id) {
        try {
          const res = await fetch(`/api/posts?creatorId=${creatorData._id}`);
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts || []);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
    }
    fetchPosts();
  }, [creatorData._id]);

  // Utility: determine if a post is viewable by the current user
  const userWallet = publicKey?.toBase58();
  function canViewPost(post: IPost): boolean {
    if (!post.isGated) return true;
    if (canEdit) return true;
    if (userWallet && post.accessibleBy.includes(userWallet)) return true;
    return false;
  }

  // Handle file input change for updating profile image
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Save profile changes
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      // Instead of alert, just set a message or error
      setMessage("No wallet connected!");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Update Creator doc via multipart/form-data
      const formData = new FormData();
      formData.append("userWalletAddress", publicKey.toBase58());
      formData.append("name", name);
      formData.append("description", description);
      formData.append("gatingEnabled", gatingEnabled ? "true" : "false");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const creatorRes = await fetch("/api/creators", {
        method: "POST",
        body: formData,
      });
      if (!creatorRes.ok) {
        const { error } = await creatorRes.json();
        throw new Error(`Creator update error: ${error}`);
      }

      // Update user doc (subscriptionAmount)
      const userPayload = {
        walletAddress: publicKey.toBase58(),
        subscriptionAmount,
      };
      const userRes = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });
      if (!userRes.ok) {
        const { error } = await userRes.json();
        throw new Error(`User update error: ${error}`);
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Purchase a gated post
  async function handlePurchasePost(post: IPost) {
    try {
      if (!publicKey) {
        setPurchaseError("No wallet connected!");
        return;
      }

      setPurchaseError("");
      setPurchaseSuccess("");
      setPurchasing(true);

      // 1) If the post is gated and a collection exists, mint the NFT first.
      // if (creatorData.collectionMint) {
      //   console.log("Minting NFT from the creator's collection...");
      //   const walletAdapter = {
      //     publicKey,
      //     signTransaction,
      //     sendTransaction: async (tx: any) =>
      //       sendTransaction(tx, new Connection(getRpcEndpoint())),
      //   };
      //   const mintedName = post.nftName || `Post NFT #${post._id}`;
      //   const mintedUri = post.nftUri || "";
      //   // If minting fails, the error will be thrown and the subsequent payment will not execute.
      //   await mintGatedNFT(
      //     getRpcEndpoint(),
      //     walletAdapter,
      //     creatorData.collectionMint,
      //     mintedName,
      //     mintedUri
      //   );
      //   console.log("NFT minted successfully!");
      // }

      // 2) Transfer lamports from buyer to creator only if NFT minting was successful.
      const connection = new Connection(getRpcEndpoint(), "confirmed");
      const creatorWallet = new PublicKey(creatorData.userWalletAddress);
      const lamportsToSend = (post.price || 0) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorWallet,
          lamports: lamportsToSend,
        })
      );

      // Sign & send the lamport transfer
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      console.log("Payment transaction confirmed:", signature);

      // 3) Unlock the gated post in our DB
      const unlockRes = await fetch("/api/posts/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post._id,
          userWallet: publicKey.toBase58(),
        }),
      });
      if (!unlockRes.ok) {
        const { error } = await unlockRes.json();
        throw new Error(error || "Failed to unlock post");
      }
      const { post: updatedPost } = await unlockRes.json();

      // Update local state
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );

      setPurchaseSuccess(
        "Successfully purchased and unlocked the post! NFT minted successfully."
      );
    } catch (err: any) {
      console.error("Purchase post error:", err);
      setPurchaseError(err.message || "Something went wrong during purchase.");
    } finally {
      setPurchasing(false);
    }
  }

  // Called after creating a post in modal
  function handlePostCreated(newPost: IPost) {
    setPosts((prev) => [newPost, ...prev]);
  }

  // Called when user clicks "Edit" on a post
  function openEditModal(post: IPost) {
    setPostBeingEdited(post);
    setEditModalOpen(true);
  }

  // Called after the post is successfully updated
  function handlePostUpdated(updated: IPost) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }

  // ------------------------------
  //           RENDER
  // ------------------------------
  if (!isEditing) {
    return (
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Background Elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00ce88] opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#9b5de5] opacity-5 blur-[120px] rounded-full"></div>

        {/* Main Container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e211c]/90 via-[#0b0f0f]/80 to-[#0e1f1a]/70 shadow-xl backdrop-blur-sm border border-[#0a0f0f]/20 mb-10">
          {/* Profile Section */}
          <div className="p-8 border-b border-[#0a0f0f]/30">
            {canEdit && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  className="relative overflow-hidden px-3 py-1.5 rounded-md bg-[#0a0f0f] text-[#00ce88] text-sm font-medium border border-[#00ce88]/20 hover:bg-[#0e211c] transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,158,198,0.3)] group"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="relative z-10 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,158,198,0.08)_0%,_transparent_80%)] opacity-0 transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:scale-125"></div>
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                {imageUrl ? (
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-[#00ce88]/30 shadow-[0_0_15px_rgba(255,158,198,0.2)] group">
                    <Image
                      src={imageUrl}
                      alt={name}
                      width={192}
                      height={192}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f1a]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#0e211c] to-[#0e1f1a] text-[#00ce88] border-2 border-[#0a0f0f]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 opacity-30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex-1 text-center md:text-left md:w-3/5">
                  <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>

                  <p className="text-[#00ce88]/70 text-sm mb-3 font-mono bg-[#0e211c]/50 px-3 py-1 rounded-lg inline-block">
                    Wallet: {creatorData.userWalletAddress.substring(0, 6)}...
                    {creatorData.userWalletAddress.substring(
                      creatorData.userWalletAddress.length - 4
                    )}
                  </p>

                  {creatorData.collectionMint && (
                    <div className="block mb-3">
                      <p className="text-[#00ce88]/70 text-sm font-mono bg-[#0e211c]/50 px-3 py-1 rounded-lg inline-block">
                        <span className="text-gray-400 mr-1">Collection:</span>
                        {creatorData.collectionMint.substring(0, 6)}...
                        {creatorData.collectionMint.substring(
                          creatorData.collectionMint.length - 4
                        )}
                      </p>
                    </div>
                  )}

                  {description && (
                    <p className="text-gray-300 mt-3 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {creatorData.collectionMint && (
                  <div className="md:w-2/5 mt-4 md:mt-0 md:ml-2">
                    <div className="p-4 bg-[#0e211c]/30 rounded-lg border border-[#0a0f0f]/50">
                      <h3 className="text-[#00ce88] text-sm font-medium mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                        </svg>
                        About This Collection
                      </h3>
                      <p className="text-gray-300 text-sm">
                        This is a verified Solana NFT collection created by this
                        creator. The Collection Mint is a unique identifier for
                        the creator&apos;s NFT collection on the Solana
                        blockchain. Owning NFTs from this collection may grant
                        you special access to premium content.
                      </p>
                      <div className="mt-3 flex">
                        <a
                          href={`https://explorer.sonic.game/address/${creatorData.collectionMint}?cluster=testnet.v1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00ce88] hover:text-[#49bf58] transition-colors flex items-center"
                        >
                          View on Sonic Explorer
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {canEdit ? "My Posts" : "Creator's Posts"}
              </h2>

              {canEdit && (
                <button
                  className="relative overflow-hidden px-3 py-1.5 rounded-md bg-[#0a0f0f] text-[#00ce88] text-sm font-medium border border-[#00ce88]/20 hover:bg-[#0e211c] transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,158,198,0.3)] group"
                  onClick={() => setShowCreateModal(true)}
                >
                  <span className="relative z-10 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create New Post
                  </span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,158,198,0.08)_0%,_transparent_80%)] opacity-0 transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:scale-125"></div>
                </button>
              )}
            </div>

            {/* Purchase Success / Error Messages */}
            {purchaseSuccess && (
              <div className="mb-6 bg-green-600/10 border border-green-500/20 text-green-400 text-sm p-3 rounded">
                {purchaseSuccess}
              </div>
            )}
            {purchaseError && (
              <div className="mb-6 bg-red-600/10 border border-red-500/20 text-red-400 text-sm p-3 rounded">
                {purchaseError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {posts.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0e211c]/50 text-[#00ce88] mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => {
                  const isVisible = canViewPost(post);
                  return (
                    <div
                      key={post._id}
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0e211c]/90 to-[#0e1f1a]/90 border border-[#0a0f0f]/30 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.2)] hover:translate-y-[-5px]"
                    >
                      {!isVisible && post.isGated ? (
                        <div className="h-full flex flex-col">
                          {/* Gated Post Content (blurred) */}
                          {post.imageUrl ? (
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt="gated content"
                                className="w-full h-full object-cover filter blur-xl scale-110 opacity-50"
                                width={220}
                                height={192}
                                unoptimized
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0e1f1a]/50 to-[#0e1f1a]/80">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00ce88] to-[#9b5de5] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,158,198,0.5)] animate-pulse">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                </div>
                                <p className="text-white text-sm font-medium px-3 py-1 rounded-full bg-[#0e1f1a]/70 backdrop-blur-sm border border-[#00ce88]/20">
                                  Premium Content
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-[#0e211c]/50 to-[#0e1f1a]/50 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00ce88] to-[#9b5de5] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,158,198,0.5)] animate-pulse">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </div>
                              <p className="text-white text-sm font-medium px-3 py-1 rounded-full bg-[#0e1f1a]/70 backdrop-blur-sm border border-[#00ce88]/20">
                                Premium Content
                              </p>
                            </div>
                          )}

                          <div className="p-4 flex-1 flex flex-col">
                            <p className="text-white font-medium mb-2 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1 text-[#00ce88]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              {post.statusText.length > 30
                                ? `${post.statusText.substring(0, 30)}...`
                                : post.statusText}
                            </p>
                            <p className="text-gray-400 text-sm italic mb-4">
                              {post.price} SOL will be deducted from your wallet
                            </p>

                            <button
                              className="relative overflow-hidden w-full mt-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00ce88] to-[#49bf58] text-[#0e1f1a] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
                              onClick={() => handlePurchasePost(post)}
                              disabled={purchasing}
                            >
                              <span className="relative z-10">
                                {purchasing
                                  ? "Processing..."
                                  : `Unlock for ${post.price} SOL`}
                              </span>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col">
                          {/* Visible Post Content */}
                          {post.imageUrl ? (
                            <div className="h-48 overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt="post"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                width={220}
                                height={192}
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gradient-to-br from-[#0e211c]/50 to-[#0e1f1a]/50 flex items-center justify-center text-gray-400">
                              <p>No image available</p>
                            </div>
                          )}

                          <div className="p-4 flex-1 flex flex-col">
                            <p className="text-white font-medium mb-2">
                              {post.statusText}
                            </p>

                            {post.isGated && (
                              <div className="mt-auto inline-flex items-center text-xs font-medium text-[#00ce88] bg-[#00ce88]/10 px-2.5 py-1 rounded-full border border-[#00ce88]/20">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                                Mint NFT for • {post.price} SOL
                              </div>
                            )}
                          </div>

                          {/* Edit Button for the Owner */}
                          {canEdit && (
                            <div className="absolute top-2 right-2">
                              <button
                                className="p-1.5 rounded-full bg-[#0e1f1a]/70 text-[#00ce88] hover:bg-[#0e211c] transition-colors duration-200 backdrop-blur-sm border border-[#00ce88]/10"
                                onClick={() => openEditModal(post)}
                                title="Edit Post"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal
            creatorId={creatorData._id as string}
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Edit Post Modal */}
        {editModalOpen && postBeingEdited && (
          <EditPostModal
            post={postBeingEdited}
            onClose={() => setEditModalOpen(false)}
            onPostUpdated={handlePostUpdated}
          />
        )}
      </div>
    );
  }

  // ------------------------------
  //        EDIT MODE (PROFILE)
  // ------------------------------
  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e211c]/90 via-[#0b0f0f]/80 to-[#0e1f1a]/70 p-8 shadow-xl backdrop-blur-sm border border-[#0a0f0f]/20 mb-10">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00ce88] opacity-5 blur-[80px] rounded-full"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full"></div>

      <form onSubmit={handleSaveProfile} className="relative z-10 space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Edit Your Profile
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Name
          </label>
          <input
            type="text"
            placeholder="Creator name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            placeholder="Describe yourself..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Profile Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {imageUrl ? (
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#00ce88]/30">
                <Image
                  src={imageUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                  unoptimized // For base64 data URLs
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl flex items-center justify-center bg-[#0e211c] text-gray-400 border border-[#0a0f0f]">
                <span>No image</span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#00ce88]/20 file:text-[#00ce88] hover:file:bg-[#00ce88]/30 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="gatingToggle"
            checked={gatingEnabled}
            onChange={(e) => setGatingEnabled(e.target.checked)}
            className="w-4 h-4 text-[#00ce88] bg-[#0e211c] border-[#0a0f0f] rounded focus:ring-[#00ce88]/50"
          />
          <label
            htmlFor="gatingToggle"
            className="ml-2 text-sm font-medium text-gray-300"
          >
            Enable token-gated content
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Subscription Amount (SOL)
          </label>
          <input
            type="number"
            step="0.01"
            value={subscriptionAmount}
            onChange={(e) => setSubscriptionAmount(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-[#0e211c]/50 border border-[#0a0f0f] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ce88]/50 focus:border-[#00ce88]/50 transition-all duration-200"
          />
        </div>

        {message && (
          <div className="px-4 py-3 rounded-lg bg-[#00ce88]/10 border border-[#00ce88]/20 text-[#00ce88] text-sm">
            {message}
          </div>
        )}

        <div className="flex items-center justify-end space-x-4 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-5 py-2.5 rounded-lg bg-[#0e211c] text-gray-300 font-medium border border-[#0a0f0f] hover:bg-[#0a0f0f] transition-colors duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00ce88] to-[#49bf58] text-[#0e1f1a] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0e1f1a]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
          </button>
        </div>
      </form>
    </div>
  );
}
