'use client';

import Link from "next/link";
import { ICreator } from "@/modules/creator/creatorModel";
import { dbConnect } from "@/lib/db";
import { getAllCreators } from "@/modules/creator/creatorService";
import Image from "next/image";
import { Suspense, useState, useEffect } from 'react';

// Loading skeleton component
function CreatorsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center max-w-6xl mx-auto">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-[300px] w-[220px] rounded-2xl bg-gradient-to-b from-[#0e211c]/50 to-[#0e211c] animate-pulse"></div>
      ))}
    </div>
  );
}

// Convert CreatorsList to a client component that fetches data
function CreatorsList({ searchQuery = '' }) {
  const [allCreators, setAllCreators] = useState<ICreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all creators once
  useEffect(() => {
    const fetchAllCreators = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/creators');

        if (!response.ok) {
          throw new Error(`Failed to fetch creators: ${response.status}`);
        }

        const data = await response.json();
        setAllCreators(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching creators:', err);
        setError('Failed to load creators');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCreators();
  }, []); // Only fetch once on mount

  // Filter creators based on search query
  const filteredCreators = searchQuery
    ? allCreators.filter(creator =>
      creator.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : allCreators;

  if (loading) return <CreatorsLoadingSkeleton />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  if (filteredCreators.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-10 text-[#00ce88]">
        <p>{searchQuery ? `No creators found matching "${searchQuery}"` : "No creators found. Be the first to join our community!"}</p>
        <Link
          href="/creator-onboarding"
          className="mt-4 px-6 py-3 bg-gradient-to-r from-[#00ce88] to-[#49bf58] text-[#0e211c] rounded-lg hover:shadow-[0_0_15px_rgba(255,158,198,0.6)] transition-all duration-300 font-medium"
        >
          Become a Creator
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center max-w-6xl mx-auto">
      {filteredCreators.map((creator: ICreator, index: number) => (
        <Link
          href={`/creator/${creator._id?.toString()}`}
          key={creator._id?.toString()}
          className="relative h-[300px] w-[220px] rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,158,198,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e211c]/50 via-transparent to-[#0e211c] opacity-60 z-10 group-hover:opacity-40 transition-all duration-300"></div>

          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            {creator.imageUrl ? (
              <Image
                src={creator.imageUrl}
                alt={creator.name}
                width={220}
                height={300}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl transition-all duration-500 group-hover:scale-110"
                priority={index < 4} // Prioritize loading first 4 images
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0e211c] to-[#0e1f1a] text-[#00ce88] rounded-2xl">
                <span className="text-4xl opacity-30">✨</span>
              </div>
            )}
          </div>

          {creator.gatingEnabled ? (
            <span className="absolute top-3 right-3 px-3 py-1 text-[10px] font-semibold text-[#0e211c] bg-[#00ce88] rounded-full z-20 shadow-lg backdrop-blur-sm">
              Token Gated
            </span>
          ) : (
            <span className="absolute top-3 right-3 px-3 py-1 text-[10px] font-semibold text-[#00ce88] bg-[#0e211c]/80 rounded-full z-20 shadow-lg backdrop-blur-sm">
              Public
            </span>
          )}

          <div className="absolute -bottom-2 h-[70px] w-full bg-gradient-to-t from-[#0e211c] to-[#0e211c]/90 backdrop-blur-sm rounded-b-2xl flex flex-col p-3 space-y-1 transition-all duration-300 group-hover:h-[80px] z-20">
            <div className="flex flex-row items-center space-x-3">
              <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-[#00ce88] group-hover:border-[3px] transition-all duration-300 shadow-[0_0_10px_rgba(255,158,198,0.3)]">
                {creator.imageUrl ? (
                  <Image
                    src={creator.imageUrl}
                    alt={creator.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#00ce88] rounded-full">
                    <span className="text-[#0e211c]">✨</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#00ce88] group-hover:text-white transition-all duration-300">
                  {creator.name || "Unknown Creator"}
                </span>
                <span className="text-xs text-[#00ce88]/70 truncate group-hover:text-[#00ce88] transition-all duration-300 max-w-[150px]">
                  {creator.description || "No description available"}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input to prevent too many filtering operations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full py-6 px-4 relative min-h-screen">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-[#0e1f1a]/80 to-black opacity-80"></div>

        {/* Static gradient orbs */}
        <div className="absolute left-1/4 top-1/3 w-[60%] h-[60%] bg-[#00ce88]/5 blur-[150px] rounded-full opacity-60"></div>
        <div className="absolute right-1/3 bottom-1/4 w-[40%] h-[40%] bg-[#9b5de5]/5 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute left-1/2 top-1/2 w-[70%] h-[70%] bg-[#49bf58]/5 blur-[100px] rounded-full opacity-40 -translate-x-1/2 -translate-y-1/2"></div>

        {/* Additional smaller gradient orbs */}
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#00ce88]/3 blur-[80px] rounded-full opacity-30"></div>
        <div className="absolute bottom-[15%] left-[15%] w-[25%] h-[25%] bg-[#9b5de5]/3 blur-[70px] rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Discover <span className="text-[#00ce88]">Creators</span>
          </h1>
          <p className="text-[#00ce88]/70 mt-3 max-w-2xl mx-auto">
            Explore talented creators sharing their unique digital art and
            collectibles
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ce88]/20 to-[#9b5de5]/20 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center bg-[#0e211c]/80 backdrop-blur-sm rounded-lg border border-[#00ce88]/30 overflow-hidden">
            <input
              type="text"
              placeholder="Search creators by name..."
              className="w-full bg-transparent py-3 px-4 text-white placeholder-[#00ce88]/50 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="flex items-center justify-center h-full px-4 text-[#00ce88] hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00ce88] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#00ce88]/30 to-transparent"></div>
        </div>

        <CreatorsList searchQuery={debouncedQuery} />
      </div>
    </div>
  );
}
