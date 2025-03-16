"use client";

import React, { useState, useEffect } from "react";
import styles from "./CreatorOnboardingForm.module.css";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CreatorOnboardingForm() {
  const { publicKey } = useWallet();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gatingEnabled, setGatingEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);

  // Fetch existing creator profile if wallet is connected
  useEffect(() => {
    async function fetchCreatorProfile() {
      if (publicKey) {
        try {
          const walletAddress = publicKey.toBase58();
          const response = await fetch(`/api/creators/${walletAddress}`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setName(data.name || "");
              setDescription(data.description || "");
              setImageUrl(data.imageUrl || "");
              setGatingEnabled(data.gatingEnabled || false);
              setExistingProfile(true);
            }
          }
        } catch (error) {
          console.error("Error fetching creator profile:", error);
        }
      }
    }

    fetchCreatorProfile();
  }, [publicKey]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Show a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      alert("No wallet connected!");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Build a single multipart/form-data payload
      const formData = new FormData();
      formData.append("userWalletAddress", publicKey.toBase58());
      formData.append("name", name);
      formData.append("description", description);
      formData.append("gatingEnabled", gatingEnabled ? "true" : "false");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/creators", {
        method: "POST",
        body: formData, // No JSON.stringify
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert(`Error onboarding creator: ${error}`);
        return;
      }

      const { creator } = await res.json();
      setMessage("Your creator profile has been saved successfully!");
      setExistingProfile(true);

      // Update the form with returned data
      setName(creator.name);
      setDescription(creator.description || "");
      setImageUrl(creator.imageUrl || "");
      setGatingEnabled(creator.gatingEnabled || false);
      setImageFile(null);
    } catch (err: any) {
      console.error("Creator onboarding error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        {existingProfile ? "Update Your Profile" : "Join as a Creator"}
      </h2>
      <p className={styles.subtitle}>
        {existingProfile
          ? "Update your profile information below."
          : "Tell us about yourself and start sharing your exclusive content."}
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="creatorName" className={styles.label}>
            Name
          </label>
          <input
            id="creatorName"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or creative handle"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="creatorDesc" className={styles.label}>
            Description
          </label>
          <textarea
            id="creatorDesc"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share a little about your work..."
            rows={4}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Profile Image</label>
          <div className={styles.imageUploadContainer}>
            {imageUrl ? (
              <div className={styles.imagePreview}>
                <img src={imageUrl} alt="Profile preview" />
              </div>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>No image selected</span>
              </div>
            )}
            <div className={styles.uploadOptions}>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <label htmlFor="imageUpload" className={styles.uploadButton}>
                {imageFile ? "Change image" : "Upload from device"}
              </label>
            </div>
          </div>
        </div>
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="gatingToggle"
            checked={gatingEnabled}
            onChange={(e) => setGatingEnabled(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="gatingToggle" className={styles.checkboxLabel}>
            Enable token-gated content
          </label>
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading
            ? "Saving Profile..."
            : existingProfile
            ? "Update Profile"
            : "Save Profile"}
        </button>
      </form>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
