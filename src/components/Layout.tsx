"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { initUser } from "@/redux/user/reducer";
import { fetchCreatorByWallet } from "@/redux/creator/reducer";

export default function Layout({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const dispatch = useDispatch<AppDispatch>();

  const creatorState = useSelector((state: RootState) => state.creator.creator);

  useEffect(() => {
    // Whenever public key changes, re-init user and fetch creator doc
    if (publicKey) {
      const walletAddress = publicKey.toBase58();
      dispatch(initUser(walletAddress));
      dispatch(fetchCreatorByWallet(walletAddress));
    }
  }, [publicKey, dispatch]);

  // Change condition: use creator document existence only
  const isCreator = Boolean(creatorState && creatorState._id);
  const creatorId = creatorState?._id?.toString();

  // Build the link label and href
  const creatorLinkLabel = isCreator ? "My Profile" : "Become a Creator";
  const creatorLinkHref = isCreator
    ? `/creator/${creatorId}`
    : "/creator-onboarding";

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-black via-[#051d38] to-black text-white border-b border-blue-800">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <nav className="flex items-center">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight hover:text-blue-300 transition duration-300"
              >
                FanPit
              </Link>
              <div className="hidden md:flex space-x-6">
                {[
                  { href: "/", label: "Home" },
                  // { href: "/dashboard", label: "Dashboard" },
                  // { href: "/onlyfans", label: "OnlyFans" },
                  { href: "/creators", label: "All Creators" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative group transition duration-300"
                  >
                    <span className="hover:text-blue-300">{link.label}</span>
                    <span className="absolute left-0 -bottom-1 h-0.5 w-full scale-x-0 bg-blue-300 transition-transform group-hover:scale-x-100"></span>
                  </Link>
                ))}
                {/* Dynamic link for Creator Onboarding or My Profile */}
                <Link
                  href={creatorLinkHref}
                  className="relative group transition duration-300"
                >
                  <span className="hover:text-blue-300">
                    {creatorLinkLabel}
                  </span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-full scale-x-0 bg-blue-300 transition-transform group-hover:scale-x-100"></span>
                </Link>
              </div>
            </div>
            {/* Wallet Section */}
            <div className="ml-auto flex items-center space-x-4">
              <div className="relative group">
                <WalletMultiButton className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-300 hover:text-black transition duration-300" />
                {publicKey && (
                  <div className="absolute right-0 top-full mt-2 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-blue-300 text-xs px-2 py-1 border border-blue-700 rounded shadow-md z-10">
                    {publicKey.toBase58()}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-black via-[#051d38] to-black text-white border-t border-blue-800 px-8 py-4">
        <div className="max-w-5xl mx-auto text-center text-sm">
          &copy; 2025 FanPit MVP
        </div>
      </footer>
    </div>
  );
}
