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
    <div className="w-full py-6 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff9ec6]">Discover Creators</h1>
        <p className="text-[#ff9ec6]/70 mt-2">
          Explore talented creators sharing their unique digital art and
          collectibles
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10 text-[#ff9ec6]">
          <p>No creators found. Be the first to join our community!</p>
          <Link
            href="/creator-onboarding"
            className="mt-4 px-4 py-2 bg-[#ff9ec6] text-[#2f1f25] rounded-lg hover:bg-[#ff9ec6]/80 transition-all duration-300"
          >
            Become a Creator
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {creators.map((creator: ICreator) => (
            <Link
              href={`/creator/${creator._id?.toString()}`}
              key={creator._id?.toString()}
              className="relative h-[300px] w-[200px] rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,158,198,0.6)]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {creator.imageUrl ? (
                  <Image
                    src={creator.imageUrl}
                    alt={creator.name}
                    width={200}
                    height={300}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl group-hover:brightness-110 transition-all duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2f1f25] text-[#ff9ec6] rounded-2xl">
                    No Image
                  </div>
                )}
              </div>
              
              {creator.gatingEnabled ? (
                <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#2f1f25] bg-[#ff9ec6] rounded-tr-lg">
                  Token Gated Content
                </span>
              ) : (
                <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#ff9ec6] bg-[#2f1f25] rounded-tr-lg">
                  Public Content
                </span>
              )}
              
              <div className="absolute bottom-0 h-[60px] w-full bg-[#2f1f25] rounded-b-2xl flex flex-col p-2 space-y-1 transition-all duration-300 group-hover:h-[70px]">
                <div className="flex flex-row items-center space-x-2">
                  <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-[#ff9ec6] group-hover:border-[3px] transition-all duration-300">
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
                        <span className="text-[#2f1f25]">?</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-[#ff9ec6] group-hover:text-white transition-all duration-300">
                      {creator.name || "Unknown Creator"}
                    </span>
                    <span className="text-xs text-[#ff9ec6]/70 truncate group-hover:text-[#ff9ec6] transition-all duration-300">
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
  );
}
