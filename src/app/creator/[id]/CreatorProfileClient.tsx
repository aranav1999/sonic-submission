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
import styles from "./CreatorProfile.module.css";
import Image from "next/image";

// --- Define the Post interface for client-side usage ---
interface IPost {
  _id: string;
  creatorId: string;
  statusText: string;
  imageUrl?: string;
  isGated: boolean;
  price?: number;
  accessibleBy: string[];
}

// ---------- Create Post Modal ----------
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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
      formData.append("creatorId", creatorId);
      formData.append("statusText", statusText);
      formData.append("isGated", isGated ? "true" : "false");
      if (isGated) {
        formData.append("price", price.toString());
      }
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
      onPostCreated(post);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>Create New Post</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>
            Post Text (max 50 words)
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={3}
              className={styles.formTextarea}
              required
            />
          </label>

          <label className={styles.formLabel}>
            Upload Image (optional)
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.formFileInput}
            />
          </label>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={isGated}
                onChange={(e) => setIsGated(e.target.checked)}
              />
              <span>Is Gated?</span>
            </label>
          </div>

          {isGated && (
            <label className={styles.formLabel}>
              Price (SOL)
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={styles.formInput}
                required
              />
            </label>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Edit Post Modal ----------
// ---------- Edit Post Modal ----------
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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1b23]/95 via-[#251920]/95 to-[#1f151c]/95 p-6 shadow-2xl backdrop-blur-sm border border-[#3a2a33]/30">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff9ec6] opacity-5 blur-[80px] rounded-full"></div>
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
              className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Update Image (optional)
            </label>
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-[#ff9ec6]/30 mb-2">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#ff9ec6]/20 file:text-[#ff9ec6] hover:file:bg-[#ff9ec6]/30 cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isGatedEdit"
              checked={isGated}
              onChange={(e) => setIsGated(e.target.checked)}
              className="w-4 h-4 text-[#ff9ec6] bg-[#2f1f25] border-[#3a2a33] rounded focus:ring-[#ff9ec6]/50"
            />
            <label htmlFor="isGatedEdit" className="ml-2 text-sm font-medium text-gray-300">
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
                className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
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
              className="px-5 py-2.5 rounded-lg bg-[#2f1f25] text-gray-300 font-medium border border-[#3a2a33] hover:bg-[#3a2a33] transition-colors duration-200"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
              disabled={loading}
            >
              <span className="relative z-10">{loading ? "Updating..." : "Save Changes"}</span>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function CreatorProfileClient({
  creatorData,
  userData,
}: {
  creatorData: ICreator;
  userData: IUser | null;
}) {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const [isEditing, setIsEditing] = useState(false);

  const getRpcEndpoint = () => {
    if (wallet) {
      // Check if the connected wallet is Backpack
      const isBackpack = wallet.adapter.name.toLowerCase().includes("backpack");
      if (isBackpack) {
        return process.env.NEXT_PUBLIC_SONIC_RPC_ENDPOINT || "";
      } else {
        // For Phantom or others
        return process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";
      }
    }
    // Default fallback if no wallet is connected
    return process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";
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

  // Purchase state
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  // Check if the connected wallet is the creator’s wallet
  const canEdit =
    publicKey && publicKey.toBase58() === creatorData.userWalletAddress;

  // Fetch posts when component mounts or creatorData._id changes
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
      alert("No wallet connected!");
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Purchase post
  async function handlePurchasePost(post: IPost) {
    try {
      if (!publicKey) {
        alert("No wallet connected!");
        return;
      }
      setPurchaseError("");
      setPurchasing(true);

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

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Unlock the Post
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

      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );

      alert("Purchase successful! You now have access to this post.");
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

  // --- Render UI ---
  if (!isEditing) {
    return (
      <>
        {/* Profile Display */}
        <div className={`${styles.profileSection}  `}>
          <div>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                className={styles.profileImage}
                width={150}
                height={150}
              />
            ) : (
              <div className={styles.noProfileImage}>No profile image</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.creatorName}>{name}</h1>
            <p className={styles.walletAddress}>
              Wallet: {creatorData.userWalletAddress.substring(0, 6)}...
              {creatorData.userWalletAddress.substring(
                creatorData.userWalletAddress.length - 4
              )}
            </p>

            {description && (
              <p className={styles.creatorDescription}>{description}</p>
            )}
          </div>
          {/* <div className={styles.subscribeContainer}>
            <button className={styles.subscribeButton}>
              Subscribe for {userData?.subscriptionAmount || 0} SOL
            </button>
          </div> */}
        </div>

        {/* Edit Button (if owner) */}
        {canEdit && (
  <div className="flex justify-end mb-4">
    <button
      className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] group"
      onClick={() => setIsEditing(true)}
    >
      <span className="relative z-10">Edit Profile</span>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
    </button>
  </div>
)}

        {/* Posts Section */}
        <div className={styles.nftSection}>
          <h2 className={styles.sectionTitle}>
            {canEdit ? "My Posts" : "Creator's Posts"}
          </h2>
          {canEdit && (
  <div className="mb-6">
    <button
      className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] group"
      onClick={() => setShowCreateModal(true)}
    >
      <span className="relative z-10 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Create New Post
      </span>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
    </button>
  </div>
)}
          <div className={styles.nftGrid} style={{ marginTop: "1rem" }}>
            {posts.length === 0 ? (
              <p className={styles.emptyMessage}>No posts yet</p>
            ) : (
              posts.map((post) => {
                const isVisible = canViewPost(post);
                return (
                  <div key={post._id} className={`${styles.postCard}`}>
                    {!isVisible && post.isGated ? (
                      <div className={styles.gatedPostContainer}>
                        {post.imageUrl ? (
                          <div className={styles.blurredImageContainer}>
                            <img
                              src={post.imageUrl}
                              alt="gated content"
                              className={styles.blurredImage}
                            />
                            <div className={styles.imageOverlay}>
                              <div className={styles.lockIcon}>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <p className={styles.gatedContentText}>
                                Premium Content
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.noImagePlaceholder}>
                            <div className={styles.lockIcon}>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <p className={styles.gatedContentText}>
                              Premium Content
                            </p>
                          </div>
                        )}
                        <div className={styles.postContent}>
                          <p className={styles.gatedPostTitle}>
                            <span className={styles.lockIndicator}>🔒</span>{" "}
                            {post.statusText.length > 30
                              ? `${post.statusText.substring(0, 30)}...`
                              : post.statusText}
                          </p>
                          <p className={styles.gatedPriceInfo}>
                            {post.price} SOL will be deducted from your wallet
                          </p>
                          <button
  className="relative overflow-hidden w-full px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
  onClick={() => handlePurchasePost(post)}
  disabled={purchasing}
>
  <span className="relative z-10 flex items-center justify-center">
    {purchasing ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1f151c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </>
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Unlock for {post.price} SOL
      </>
    )}
  </span>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
</button>
                          {purchaseError && (
                            <p style={{ color: "red" }}>{purchaseError}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.postContent}>
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt="post"
                            className={styles.postImage}
                          />
                        ) : (
                          <div className={styles.noImagePlaceholder}>
                            <p>No image available</p>
                          </div>
                        )}
                        <p className={styles.postText}>{post.statusText}</p>
                        {post.isGated && (
                          <div className={styles.gatedBadge}>
                            Premium Content • {post.price} SOL
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit Button for the Owner */}
                    {canEdit && (
  <div className="mt-2 px-3 pb-3">
    <button
      className="w-full relative overflow-hidden px-4 py-2 rounded-lg bg-gradient-to-r from-[#3a2a33] to-[#2f1f25] text-[#ff9ec6] text-sm font-medium border border-[#ff9ec6]/20 transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,158,198,0.3)] group"
      onClick={() => openEditModal(post)}
    >
      <span className="relative z-10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Post
      </span>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,158,198,0.08)_0%,_transparent_80%)] opacity-0 transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:scale-125"></div>
    </button>
  </div>
)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showCreateModal && (
          <CreatePostModal
            creatorId={creatorData._id as string}
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {editModalOpen && postBeingEdited && (
          <EditPostModal
            post={postBeingEdited}
            onClose={() => setEditModalOpen(false)}
            onPostUpdated={(updated: IPost) => {
              handlePostUpdated(updated);
              setEditModalOpen(false);
            }}
          />
        )}
      </>
    );
  }

  // --- Edit Mode for Profile ---
// --- Edit Mode for Profile ---
return (
  <div className="relative z-10 max-w-2xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1b23]/90 via-[#251920]/80 to-[#1f151c]/70 p-8 shadow-xl backdrop-blur-sm border border-[#3a2a33]/20 mb-10">
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff9ec6] opacity-5 blur-[80px] rounded-full"></div>
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full"></div>
    
    <form onSubmit={handleSaveProfile} className="relative z-10 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
        Edit Your Profile
      </h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Name</label>
        <input
          type="text"
          placeholder="Creator name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          placeholder="Describe yourself..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Profile Image</label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {imageUrl ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-[#ff9ec6]/30 shadow-[0_0_15px_rgba(255,158,198,0.2)] group">
              <Image
                src={imageUrl}
                alt="Profile preview"
                width={128}
                height={128}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f151c]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#2f1f25] to-[#1f151c] text-[#ff9ec6] border-2 border-[#3a2a33]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          <div className="flex-grow">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#ff9ec6]/20 file:text-[#ff9ec6] hover:file:bg-[#ff9ec6]/30 cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-400">
              Recommended: Square image, at least 500x500 pixels
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="gatingToggleProfile"
          checked={gatingEnabled}
          onChange={(e) => setGatingEnabled(e.target.checked)}
          className="w-4 h-4 text-[#ff9ec6] bg-[#2f1f25] border-[#3a2a33] rounded focus:ring-[#ff9ec6]/50"
        />
        <label htmlFor="gatingToggleProfile" className="ml-2 text-sm font-medium text-gray-300">
          Enable token-gated content
        </label>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Subscription Amount (SOL)</label>
        <input
          type="number"
          step="0.01"
          value={subscriptionAmount}
          onChange={(e) => setSubscriptionAmount(Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
        />
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-5 py-2.5 rounded-lg bg-[#2f1f25] text-gray-300 font-medium border border-[#3a2a33] hover:bg-[#3a2a33] transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
          disabled={loading}
        >
          <span className="relative z-10">{loading ? "Saving..." : "Save Changes"}</span>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
        </button>
      </div>
    </form>
    
    {message && (
      <div className="mt-6 px-4 py-3 rounded-lg bg-[#ff9ec6]/10 border border-[#ff9ec6]/20 text-[#ff9ec6]">
        {message}
      </div>
    )}
    
    {loading && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#2a1b23] p-6 rounded-xl shadow-2xl border border-[#ff9ec6]/20 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#ff9ec6]/20 border-t-[#ff9ec6] rounded-full animate-spin mb-4"></div>
          <p className="text-[#ff9ec6]">Saving your profile...</p>
        </div>
      </div>
    )}
  </div>
);

}
