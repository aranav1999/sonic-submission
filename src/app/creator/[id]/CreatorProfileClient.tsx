// File: src/app/creator/[id]/CreatorProfileClient.tsx
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

// --- Modal component for creating a new post ---
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

// --- Main CreatorProfileClient component ---
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
    const isBackpack = wallet.adapter.name.toLowerCase().includes('backpack');
    
    if (isBackpack) {
      return "https://sonic.helius-rpc.com/?cluster=testnet.v1";
    } else {
      // For Phantom or any other wallet
      return "https://api.devnet.solana.com";
    }
  }
  
  // Default fallback if no wallet is connected
  return "https://api.testnet.solana.com";
};

  // Local state for editing profile
  const [name, setName] = useState(creatorData.name || "");
  const [description, setDescription] = useState(
    creatorData.description || ""
  );
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

  // State for posts and modal
  const [posts, setPosts] = useState<IPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Save profile changes (existing functionality)
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

  // --- New Feature: Execute SOL trade and unlock gated post ---
  async function handlePurchasePost(post: IPost) {
    try {
      if (!publicKey) {
        alert("No wallet connected!");
        return;
      }
      setPurchaseError("");
      setPurchasing(true);

      // --- 1) SOL Transfer ---
      // Use devnet endpoint
      const connection = new Connection(getRpcEndpoint(), "confirmed");


      const creatorWallet = new PublicKey(creatorData.userWalletAddress);
      const lamportsToSend = (post.price || 0) * LAMPORTS_PER_SOL;

      // Create transaction for SOL transfer
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorWallet,
          lamports: lamportsToSend,
        })
      );

      // Send the transaction
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction signature:", signature);
      await connection.confirmTransaction(signature, "confirmed");
      console.log("SOL transfer confirmed on devnet.");

      // --- 2) Unlock the Post ---
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

      // Update local posts state so that the unlocked post is visible
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

  // --- Render UI ---
  if (!isEditing) {
    return (
      <>
        {/* Profile Display */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer}>
            {imageUrl ? (
              <img src={imageUrl} alt={name} className={styles.profileImage} />
            ) : (
              <div className={styles.noProfileImage}>No profile image</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.creatorName}>{name}</h1>
            {description && (
              <p className={styles.creatorDescription}>{description}</p>
            )}
            <p className={styles.walletAddress}>
              Wallet:{" "}
              {creatorData.userWalletAddress.substring(0, 6)}...
              {creatorData.userWalletAddress.substring(
                creatorData.userWalletAddress.length - 4
              )}
            </p>
          </div>
          <div className={styles.subscribeContainer}>
            <button className={styles.subscribeButton}>
              Subscribe for {userData?.subscriptionAmount || 0} SOL
            </button>
          </div>
        </div>

        {/* Edit Button (if owner) */}
        {canEdit && (
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <button
              className={styles.editProfileButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Posts Section */}
        <div className={styles.nftSection}>
          <h2 className={styles.sectionTitle}>
            {canEdit ? "My Posts" : "Creator's Posts"}
          </h2>
          {canEdit && (
            <button
              className={styles.subscribeButton}
              onClick={() => setShowCreateModal(true)}
            >
              Create New Post
            </button>
          )}
          <div className={styles.nftGrid} style={{ marginTop: "1rem" }}>
            {posts.length === 0 ? (
              <p className={styles.emptyMessage}>No posts yet</p>
            ) : (
              posts.map((post) => {
                const isVisible = canViewPost(post);
                return (
                  <div key={post._id} className={styles.postCard}>
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
                            className={styles.purchaseButton}
                            onClick={() => handlePurchasePost(post)}
                            disabled={purchasing}
                          >
                            {purchasing
                              ? "Processing..."
                              : `Unlock for ${post.price} SOL`}
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
            onPostCreated={(newPost) =>
              setPosts((prev) => [newPost, ...prev])
            }
          />
        )}
      </>
    );
  }

  // --- Edit Mode for Profile ---
  return (
    <div className={styles.editFormContainer}>
      <form onSubmit={handleSaveProfile} className={styles.editForm}>
        <h2 className={styles.editFormTitle}>Edit Your Profile</h2>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Creator name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            placeholder="Describe yourself..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formTextarea}
            rows={4}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Profile Image</label>
          {imageUrl ? (
            <div className={styles.imagePreview}>
              <img src={imageUrl} alt="Profile preview" />
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>No image selected</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.formFileInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={gatingEnabled}
              onChange={(e) => setGatingEnabled(e.target.checked)}
            />
            &nbsp;Enable token-gated content
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>Subscription Amount (SOL)</label>
          <input
            type="number"
            step="0.01"
            value={subscriptionAmount}
            onChange={(e) => setSubscriptionAmount(Number(e.target.value))}
            className={styles.formInput}
          />
        </div>
        <div className={styles.editFormActions}>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
