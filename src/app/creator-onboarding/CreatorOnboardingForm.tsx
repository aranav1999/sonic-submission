"use client";

import React, { useState, useEffect } from "react";
import styles from "./CreatorOnboardingForm.module.css";
import { useWallet } from "@solana/wallet-adapter-react";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  publicKey as umiPubKey,
} from "@metaplex-foundation/umi";
import {
  createCollection,
  mplCore,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import {
  fromWeb3JsKeypair,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { PublicKey } from "@metaplex-foundation/js";


async function deployCollectionViaUmi(
  rpcEndpoint: string,
  walletPubkey: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  collectionName: string,
  collectionUri: string,
  royaltyBasisPoints: number
): Promise<PublicKey> {
  // 1) Create a Umi instance with the given endpoint
  const umi = createUmi(rpcEndpoint).use(mplCore());
  console.log("////////////// Umi:", umi);

  // 2) Generate ephemeral keypair for the new collection
  const collectionSigner = generateSigner(umi);
  const walletKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.NEXT_PUBLIC_SIGNER_PRIVATE_KEY!)
  );
  umi.use(keypairIdentity(fromWeb3JsKeypair(walletKeypair)));
  console.log("////////////// Collection Signer:", collectionSigner);
  // 3) Build the createCollection instructions
  const tx = await createCollection(umi, {
    collection: collectionSigner,
    name: collectionName,
    uri: collectionUri,
    plugins: [
      {
        type: "Royalties",
        // Pass royaltyBasisPoints directly
        basisPoints: royaltyBasisPoints,
        creators: [
          {
            address: umiPubKey(walletPubkey),
            percentage: 100, // entire share to user’s wallet
          },
        ],
        ruleSet: ruleSet("None"),
      },
    ],
  }).sendAndConfirm(umi);
  console.log("////////////// Collection TX:", tx);
  
  // Return the ephemeral collection address
  return toWeb3JsPublicKey(collectionSigner.publicKey);
}

export default function CreatorOnboardingForm() {
  const { publicKey, signTransaction, connected } = useWallet();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gatingEnabled, setGatingEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);

  /**
   * NEW: Collection-related fields
   */
  const [collectionName, setCollectionName] = useState("");
  const [collectionUri, setCollectionUri] = useState("");
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState(500); // e.g. 500 => 5%

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

  /**
   * Helper: Upload metadata and image to IPFS via our server API.
   */
  async function uploadMetadataToIpfs(): Promise<string> {
    if (!imageFile) {
      throw new Error("Image file is required for IPFS upload.");
    }
    const ipfsFormData = new FormData();
    ipfsFormData.append("image", imageFile);
    ipfsFormData.append("name", name);
    ipfsFormData.append("description", description);

    const res = await fetch("/api/ipfs", {
      method: "POST",
      body: ipfsFormData,
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to upload to IPFS");
    }
    const { metadataUri } = await res.json();
    return metadataUri;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !connected) {
      alert("No wallet connected or wallet not ready!");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      let collectionMint = "";

      // (1) If imageFile exists, upload to IPFS for new collection metadata
      if (imageFile) {
        const newCollectionUri = await uploadMetadataToIpfs();
        console.log("Uploaded metadata to IPFS. URI:", newCollectionUri);
        setCollectionUri(newCollectionUri);
      }
      // (2) Deploy the Metaplex collection (only if creating a new profile)
      if (!existingProfile) {
        const rpcEndpoint = "https://api.testnet.sonic.game";
        console.log("//////////////////Deploying collection via Umi...");
        const mintedCollection = await deployCollectionViaUmi(
          rpcEndpoint,
          publicKey.toBase58(),
          async (tx) => {
            // signTransaction from the Phantom wallet
            return await signTransaction!(tx);
          },
          collectionName,
          collectionUri,
          royaltyBasisPoints
        );
        collectionMint = mintedCollection.toBase58();
        console.log("New collectionMint =>", collectionMint);
      }

      // (3) Build a multipart/form-data payload to upsert the creator profile
      const formData = new FormData();
      formData.append("userWalletAddress", publicKey.toBase58());
      formData.append("name", name);
      formData.append("description", description);
      formData.append("gatingEnabled", gatingEnabled ? "true" : "false");
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (collectionMint) {
        formData.append("collectionMint", collectionMint);
      }
      if (collectionUri) {
        formData.append("collectionUri", collectionUri);
      }

      const res = await fetch("/api/creators", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert(`Error onboarding/updating creator: ${error}`);
        return;
      }

      const { creator } = await res.json();
      setMessage("Your creator profile has been saved successfully!");
      setExistingProfile(true);

      // Update local state with returned data
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
          : "Tell us about yourself and, if desired, deploy a new Metaplex collection."}
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Info */}
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

        {/* Profile Image */}
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

        {/* Token-Gated Toggle */}
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

        {/* Deploy Collection Fields (Only if new) */}
        {!existingProfile && (
          <>
            <hr style={{ margin: "20px 0", borderColor: "#444" }} />
            <h3 style={{ color: "#ff4081" }}>Metaplex Collection Details</h3>
            <p style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: 10 }}>
              These fields are used to deploy a new collection NFT on Solana.
            </p>
            <div className={styles.inputGroup}>
              <label htmlFor="collectionName" className={styles.label}>
                Collection Name
              </label>
              <input
                id="collectionName"
                type="text"
                className={styles.input}
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. My Exclusive Collection"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="collectionUri" className={styles.label}>
                Metadata URI (auto-uploaded to IPFS)
              </label>
              <input
                id="collectionUri"
                type="text"
                className={styles.input}
                value={collectionUri}
                readOnly
                placeholder="Will be set after IPFS upload"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="collectionRoyalties" className={styles.label}>
                Royalty (basis points)
              </label>
              <input
                id="collectionRoyalties"
                type="number"
                className={styles.input}
                min={0}
                max={10000}
                value={royaltyBasisPoints}
                onChange={(e) => setRoyaltyBasisPoints(Number(e.target.value))}
              />
              <small style={{ color: "#888" }}>
                500 = 5%, 1000 = 10%, etc.
              </small>
            </div>
          </>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading
            ? "Saving Profile..."
            : existingProfile
            ? "Update Profile"
            : "Save Profile & Deploy Collection"}
        </button>
      </form>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
