import Link from "next/link";
import { ICreator } from "@/modules/creator/creatorModel";
import { dbConnect } from "@/lib/db";
import { getAllCreators } from "@/modules/creator/creatorService";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  await dbConnect();
  const creators = await getAllCreators();

  return (
    <div className="w-full py-6 px-4 relative min-h-screen">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main background gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-[#1f151c]/80 to-black opacity-80"></div>
        
        {/* Static gradient orbs */}
        <div className="absolute left-1/4 top-1/3 w-[60%] h-[60%] bg-[#ff9ec6]/5 blur-[150px] rounded-full opacity-60"></div>
        <div className="absolute right-1/3 bottom-1/4 w-[40%] h-[40%] bg-[#9b5de5]/5 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute left-1/2 top-1/2 w-[70%] h-[70%] bg-[#ff7eb6]/5 blur-[100px] rounded-full opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Additional smaller gradient orbs */}
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#ff9ec6]/3 blur-[80px] rounded-full opacity-30"></div>
        <div className="absolute bottom-[15%] left-[15%] w-[25%] h-[25%] bg-[#9b5de5]/3 blur-[70px] rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            Discover <span className="text-[#ff9ec6]">Creators</span>
          </h1>
          <p className="text-[#ff9ec6]/70 mt-3 max-w-2xl mx-auto">
            Explore talented creators sharing their unique digital art and
            collectibles
          </p>
        </div>

        {creators.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 text-[#ff9ec6]">
            <p>No creators found. Be the first to join our community!</p>
            <Link
              href="/creator-onboarding"
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ff9ec6] to-[#ff7eb6] text-[#2f1f25] rounded-lg hover:shadow-[0_0_15px_rgba(255,158,198,0.6)] transition-all duration-300 font-medium"
            >
              Become a Creator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
            {creators.map((creator: ICreator) => (
              <Link
                href={`/creator/${creator._id?.toString()}`}
                key={creator._id?.toString()}
                className="relative h-[300px] w-[220px] rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,158,198,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#2f1f25]/50 via-transparent to-[#2f1f25] opacity-60 z-10 group-hover:opacity-40 transition-all duration-300"></div>
                
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  {creator.imageUrl ? (
                    <Image
                      src={creator.imageUrl}
                      alt={creator.name}
                      width={220}
                      height={300}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl transition-all duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2f1f25] to-[#1f151c] text-[#ff9ec6] rounded-2xl">
                      <span className="text-4xl opacity-30">✨</span>
                    </div>
                  )}
                </div>
                
                {creator.gatingEnabled ? (
                  <span className="absolute top-3 right-3 px-3 py-1 text-[10px] font-semibold text-[#2f1f25] bg-[#ff9ec6] rounded-full z-20 shadow-lg backdrop-blur-sm">
                    Token Gated
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 px-3 py-1 text-[10px] font-semibold text-[#ff9ec6] bg-[#2f1f25]/80 rounded-full z-20 shadow-lg backdrop-blur-sm">
                    Public
                  </span>
                )}
                
                <div className="absolute bottom-0 h-[70px] w-full bg-gradient-to-t from-[#2f1f25] to-[#2f1f25]/90 backdrop-blur-sm rounded-b-2xl flex flex-col p-3 space-y-1 transition-all duration-300 group-hover:h-[80px] z-20">
                  <div className="flex flex-row items-center space-x-3">
                    <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-[#ff9ec6] group-hover:border-[3px] transition-all duration-300 shadow-[0_0_10px_rgba(255,158,198,0.3)]">
                      {creator.imageUrl ? (
                        <Image
                          src={creator.imageUrl}
                          alt={creator.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#ff9ec6] rounded-full">
                          <span className="text-[#2f1f25]">✨</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-[#ff9ec6] group-hover:text-white transition-all duration-300">
                        {creator.name || "Unknown Creator"}
                      </span>
                      <span className="text-xs text-[#ff9ec6]/70 truncate group-hover:text-[#ff9ec6] transition-all duration-300 max-w-[150px]">
                        {creator.description || "No description available"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
