import { dbConnect } from "@/lib/db";
import { getAllCreators } from "@/modules/creator/creatorService";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const MarqueeCards = async () => {
  let creators: any = [];

  try {
    await dbConnect();
    creators = await getAllCreators();
  } catch (error) {
    console.error("Error fetching creators:", error);
  }

  if (creators.length === 0) {
    return (
      <div className="w-full text-center py-6 text-[#1ab071]">
        No creators found. Be the first to join our community!
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex gap-6 w-max animate-marquee">
        {[...creators, ...creators].map((creator, i) => (
          <Link
            key={`${creator._id?.toString()}-${i}`}
            href={`/creator/${creator._id?.toString()}`}
            className="relative h-[300px] w-[200px] rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,158,198,0.6)]"
          >
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
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0e1f1a] rounded-2xl">
                <span className="text-[#1ab071]">No Image</span>
              </div>
            )}

            {creator.gatingEnabled ? (
              <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#0e1f1a] bg-[#1ab071] rounded-tr-lg">
                Token Gated Content
              </span>
            ) : (
              <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#1ab071] bg-[#0e1f1a] rounded-tr-lg">
                Public Content
              </span>
            )}

            <div className="absolute bottom-0 h-[60px] w-full bg-[#0e1f1a] rounded-b-2xl flex flex-col p-2 space-y-1 transition-all duration-300 group-hover:h-[70px]">
              <div className="flex flex-row items-center space-x-2">
                <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-[#1ab071] group-hover:border-[3px] transition-all duration-300">
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
                    <div className="w-full h-full flex items-center justify-center bg-[#1ab071] rounded-full">
                      <span className="text-[#0e1f1a]">?</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white group-hover:text-white transition-all duration-300">
                    {creator.name || "Unknown Creator"}
                  </span>
                  {creator.description && (
                    <span className="text-xs text-[#1ab071]/70 truncate group-hover:text-[#1ab071] transition-all duration-300">
                      {creator.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MarqueeCards;
