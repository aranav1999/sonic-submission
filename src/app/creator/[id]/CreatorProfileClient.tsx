"use client";

import React, { useState, useEffect } from "react";
import { ICreator } from "@/modules/creator/creatorModel";
import { IUser } from "@/modules/user/userModel";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./CreatorProfile.module.css";

/**
 * The new Post interface (simplified client-side shape).
 */
interface IPost {
  _id: string;
  creatorId: string;
  statusText: string;
  imageUrl?: string;
  isGated: boolean;
  price?: number;
  accessibleBy: string[];
}

/**
 * A small sub-component for creating a new post. This is a modal form.
 */
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
      // Build multipart form
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

/**
 * Client-side component that displays a creator's profile info and posts.
 * If the connected wallet is the same as the creator's, allows editing and new posts.
 */
export default function CreatorProfileClient({
  creatorData,
  userData,
}: {
  creatorData: ICreator;
  userData: IUser | null;
}) {
  const { publicKey } = useWallet();
  const [isEditing, setIsEditing] = useState(false);

  // We store local form states for editing the creator's profile
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

  // Check if connected user is the same as this creator's wallet
  const canEdit =
    publicKey && publicKey.toBase58() === creatorData.userWalletAddress;

  // State for posts
  const [posts, setPosts] = useState<IPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch the creator's posts
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

  // Only show user the post if not gated OR if canEdit OR if user's wallet is in "accessibleBy"
  const userWallet = publicKey?.toBase58();
  function canViewPost(post: IPost): boolean {
    if (!post.isGated) {
      return true; // public post
    }
    // if the user is the creator, always can see
    if (canEdit) return true;
    // otherwise must be in accessibleBy
    if (userWallet && post.accessibleBy.includes(userWallet)) {
      return true;
    }
    return false;
  }

  // Handle the file input for updating profile
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      alert("No wallet connected!");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1) Update the Creator doc
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

      // 2) Update the user doc (subscriptionAmount)
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

  // --------------------
  // RENDER LOGIC
  // --------------------

  // VIEW MODE for the profile
  if (!isEditing) {
    return (
      <>
        {/* Basic Profile info */}
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
              Wallet: {creatorData.userWalletAddress.substring(0, 6)}...
              {creatorData.userWalletAddress.substring(
                creatorData.userWalletAddress.length - 4
              )}
            </p>
          </div>

          {/* Subscription button (publicly visible) */}
          <div className={styles.subscribeContainer}>
            <button className={styles.subscribeButton}>
              Subscribe for {userData?.subscriptionAmount || 0} SOL
            </button>
          </div>
        </div>

        {/* Show an Edit button if the connected user matches */}
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
                // Only show post if user can view
                const isVisible = canViewPost(post);
                return (
                  <div
                    key={post._id}
                    style={{
                      border: "1px solid #555",
                      padding: "1rem",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  >
                    {/* If the post is not visible, we can just show a "locked" message */}
                    {!isVisible ? (
                      <div style={{ color: "#999" }}>
                        <p>
                          <strong>Locked Content</strong> - Gated post
                        </p>
                        <p>Price: {post.price} SOL</p>
                      </div>
                    ) : (
                      <>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="post"
                            style={{
                              width: "100%",
                              height: "auto",
                              marginBottom: 10,
                            }}
                          />
                        )}
                        <p>{post.statusText}</p>
                        {post.isGated && (
                          <p style={{ color: "#ff4081" }}>
                            Gated Post (Price: {post.price} SOL)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showCreateModal && (
          <CreatePostModal
            creatorId={creatorData._id as string || ""}
            onClose={() => setShowCreateModal(false)}
            onPostCreated={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
            }}
          />
        )}
      </>
    );
  }

  // EDIT MODE for the profile
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
