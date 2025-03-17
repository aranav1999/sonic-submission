"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

// Umi + Metaplex
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  publicKey as umiPubKey,
} from "@metaplex-foundation/umi";
import {
  mplCore,
  createCollection,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import { toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

interface IWalletAdapter {
  publicKey: any; // from @solana/web3.js (Phantom, etc.)
  signTransaction?: (tx: any) => Promise<any>;
  signAllTransactions?: (txs: any[]) => Promise<any[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

/**
 * Deploy a new Metaplex Collection via Umi using the connected wallet.
 */
async function deployCollectionViaUmi(
  rpcEndpoint: string,
  walletAdapter: IWalletAdapter,
  collectionName: string,
  collectionUri: string,
  royaltyBasisPoints: number
): Promise<string> {
  if (!walletAdapter.publicKey) {
    throw new Error("No wallet connected or publicKey is null.");
  }
  if (!walletAdapter.signTransaction) {
    throw new Error("This wallet does not support signTransaction.");
  }

  // 1) Create a Umi instance, use the Core plugin and the wallet adapter
  const umi = createUmi(rpcEndpoint)
    .use(mplCore())
    .use(walletAdapterIdentity(walletAdapter));

  // 2) Generate an ephemeral signer to represent the new Collection NFT
  const collectionSigner = generateSigner(umi);

  // 3) Create the collection
  const txBuilder = await createCollection(umi, {
    collection: collectionSigner,
    name: collectionName,
    uri: collectionUri,
    plugins: [
      {
        type: "Royalties",
        basisPoints: royaltyBasisPoints,
        creators: [
          {
            address: umiPubKey(walletAdapter.publicKey.toBase58()),
            percentage: 100, // entire share to the user's wallet
          },
        ],
        ruleSet: ruleSet("None"),
      },
    ],
  });

  // 4) Send and confirm transaction
  const tx = await txBuilder.sendAndConfirm(umi);

  console.log("Created new collection with transaction:", tx.signature);
  // Return the ephemeral collection address as a Web3.js string
  return toWeb3JsPublicKey(collectionSigner.publicKey).toBase58();
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
   * Collection-related fields for deploying on chain
   */
  const [collectionName, setCollectionName] = useState("");
  const [collectionUri, setCollectionUri] = useState("");
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState(500); // e.g. 500 => 5%

  // RPC endpoint: can be your devnet or custom Sonic/Helius RPC
  const rpcEndpoint = "https://api.testnet.sonic.game";

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
   * Helper: Upload metadata + image to IPFS via our server API.
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

  /**
   * Handle form submission: upsert Creator profile and optionally deploy new collection
   */
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

      // (1) If user provided a new imageFile, upload to IPFS => newCollectionUri
      if (imageFile) {
        const newCollectionUri = await uploadMetadataToIpfs();
        console.log("Uploaded metadata to IPFS. URI:", newCollectionUri);
        setCollectionUri(newCollectionUri);
      }

      // (2) Deploy the Metaplex collection if user is a brand new profile
      //     (existingProfile == false => deploy new collection)
      if (!existingProfile) {
        // Build a wallet adapter object for the Umi plugin
        const walletAdapter: IWalletAdapter = {
          publicKey,
          signTransaction,
        };

        // We must have signTransaction to proceed
        if (!signTransaction) {
          throw new Error(
            "Wallet does not support signTransaction or is not ready."
          );
        }

        console.log("Deploying new collection via Umi...");
        const mintedCollectionAddress = await deployCollectionViaUmi(
          rpcEndpoint,
          walletAdapter,
          collectionName,
          collectionUri,
          royaltyBasisPoints
        );
        collectionMint = mintedCollectionAddress;
        console.log("New collectionMint =>", collectionMint);
      }

      // (3) Upsert the creator profile
      //     Build a multipart/form-data payload
      const formData = new FormData();
      formData.append("userWalletAddress", publicKey.toBase58());
      formData.append("name", name);
      formData.append("description", description);
      formData.append("gatingEnabled", gatingEnabled ? "true" : "false");
      if (imageFile) {
        formData.append("image", imageFile);
      }
      // If we deployed a new collection, attach it
      if (collectionMint) {
        formData.append("collectionMint", collectionMint);
      }
      // If we have a new IPFS URI, attach it (optional usage on server)
      if (collectionUri) {
        formData.append("collectionUri", collectionUri);
      }

      const res = await fetch("/api/creators", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(`Creator update error: ${error}`);
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
    <div className="relative z-10 max-w-2xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1b23]/90 via-[#251920]/80 to-[#1f151c]/70 p-8 shadow-xl backdrop-blur-sm border border-[#3a2a33]/20">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ff9ec6] opacity-5 blur-[80px] rounded-full"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full"></div>

      <h2 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
        {existingProfile ? "Update Your Profile" : "Join as a Creator"}
      </h2>
      <p className="text-[#ff9ec6]/70 mb-6">
        {existingProfile
          ? "Update your profile information below."
          : "Tell us about yourself and, if desired, deploy a new Metaplex collection."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <label
            htmlFor="creatorName"
            className="block text-sm font-medium text-gray-300"
          >
            Name
          </label>
          <input
            id="creatorName"
            type="text"
            className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or creative handle"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="creatorDesc"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="creatorDesc"
            className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share a little about your work..."
            rows={4}
          />
        </div>

        {/* Profile Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Profile Image
          </label>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 opacity-30"
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

            <div className="flex-grow">
              <input
                type="file"
                id="imageUpload"
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

        {/* Token-Gated Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gatingToggle"
            checked={gatingEnabled}
            onChange={(e) => setGatingEnabled(e.target.checked)}
            className="w-4 h-4 text-[#ff9ec6] bg-[#2f1f25] border-[#3a2a33] rounded focus:ring-[#ff9ec6]/50"
          />
          <label
            htmlFor="gatingToggle"
            className="ml-2 text-sm font-medium text-gray-300"
          >
            Enable token-gated content
          </label>
        </div>

        {/* Deploy Collection Fields (Only if new) */}
        {!existingProfile && (
          <div className="mt-8 pt-6 border-t border-[#3a2a33]/50">
            <h3 className="text-lg font-semibold text-[#ff9ec6] mb-3">
              Metaplex Collection Details
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              These fields are used to deploy a new collection NFT on Solana.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="collectionName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Collection Name
                </label>
                <input
                  id="collectionName"
                  type="text"
                  className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. My Exclusive Collection"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="collectionUri"
                  className="block text-sm font-medium text-gray-300"
                >
                  Metadata URI (auto-uploaded to IPFS)
                </label>
                <input
                  id="collectionUri"
                  type="text"
                  className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200 opacity-75"
                  value={collectionUri}
                  readOnly
                  placeholder="Will be set after IPFS upload"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="collectionRoyalties"
                  className="block text-sm font-medium text-gray-300"
                >
                  Royalty (basis points)
                </label>
                <input
                  id="collectionRoyalties"
                  type="number"
                  className="w-full px-4 py-2.5 bg-[#2f1f25]/50 border border-[#3a2a33] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff9ec6]/50 focus:border-[#ff9ec6]/50 transition-all duration-200"
                  min={0}
                  max={10000}
                  value={royaltyBasisPoints}
                  onChange={(e) =>
                    setRoyaltyBasisPoints(Number(e.target.value))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">
                  500 = 5%, 1000 = 10%, etc.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="relative overflow-hidden w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#1f151c] font-medium shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,158,198,0.5)] disabled:opacity-70 disabled:cursor-not-allowed group"
          disabled={loading}
        >
          <span className="relative z-10">
            {loading
              ? "Saving Profile..."
              : existingProfile
              ? "Update Profile"
              : "Save Profile & Deploy Collection"}
          </span>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
        </button>
      </form>

      {message && (
        <div className="mt-6 px-4 py-3 rounded-lg bg-[#ff9ec6]/10 border border-[#ff9ec6]/20 text-[#ff9ec6]">
          {message}
        </div>
      )}

      {!publicKey && (
        <div className="mt-6 px-4 py-3 rounded-lg bg-[#ff9ec6]/10 border border-[#ff9ec6]/20 text-[#ff9ec6] text-center">
          Please connect your wallet to continue
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#2a1b23] p-6 rounded-xl shadow-2xl border border-[#ff9ec6]/20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#ff9ec6]/20 border-t-[#ff9ec6] rounded-full animate-spin mb-4"></div>
            <p className="text-[#ff9ec6]">Processing your request...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}
