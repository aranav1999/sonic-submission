"use client";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { initUser } from "@/redux/user/reducer";
import { fetchCreatorByWallet } from "@/redux/creator/reducer";
import { useEffect } from "react";

const Header = () => {
  const { publicKey } = useWallet();
  const dispatch = useDispatch<AppDispatch>();

  const creatorState = useSelector((state: RootState) => state.creator.creator);

  useEffect(() => {
    if (publicKey) {
      const walletAddress = publicKey.toBase58();
      dispatch(initUser(walletAddress));
      dispatch(fetchCreatorByWallet(walletAddress));
    }
  }, [publicKey, dispatch]);

  const isCreator = Boolean(creatorState && creatorState._id);
  const creatorId = creatorState?._id?.toString();
  const creatorLinkLabel = isCreator ? "My Profile" : "Become a Creator";
  const creatorLinkHref = isCreator ? `/creator/${creatorId}` : "/creator-onboarding";

  return (
    <header className="w-full bg-gradient-to-r from-black via-[#0e211c] to-black text-white border-b border-[#0e211c]  h-[55px] relative z-50">
      <div className="max-w-7xl mx-auto px-6 pt-[12px] flex items-center  justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-semibold tracking-tight hover:text-[#00ce88] transition duration-300"
        >
          FanPit<span className="inline-block w-2 h-2 rounded-full bg-[#00ce88] mx-0.5 align-middle"></span>fun
        </Link>


        {/* Navigation & Wallet */}
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-4 text-sm">
            {[
              { href: "/", label: "Home" },
              { href: "/creators", label: "All Creators" },
              // { href: "/profile", label: "Profile" }, // Added Profile link
            ].map((link) => (
              <Link key={link.href} href={link.href} className="relative group transition duration-300">
                <span className="hover:text-#00ce88">{link.label}</span>
                <span className="absolute left-0 -bottom-1 h-0.5 w-full scale-x-0 bg-[#00ce88] transition-transform group-hover:scale-x-100"></span>
              </Link>
            ))}
            <Link href={creatorLinkHref} className="relative group transition duration-300">
              <span className="hover:text-[#00ce88]">{creatorLinkLabel}</span>
              <span className="absolute left-0 -bottom-1 h-0.5 w-full scale-x-0 bg-[#00ce88] transition-transform group-hover:scale-x-100"></span>
            </Link>
          </nav>

          {/* Wallet Button */}
          <div className="relative group">
            <WalletMultiButton style={{ backgroundColor: '#00ce88', color: 'black' }} />
            {publicKey && (
              <div className="absolute right-0 top-full w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-#00ce88 text-xs px-2 py-1 border border-purple-700 rounded shadow-md z-10">
                {publicKey.toBase58()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
