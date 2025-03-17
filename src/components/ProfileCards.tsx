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
      <div className="w-full text-center py-6 text-[#ff9ec6]">
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
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#2f1f25] rounded-2xl">
                <span className="text-[#ff9ec6]">No Image</span>
              </div>
            )}
            
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
                  <span className="font-semibold text-sm text-white group-hover:text-white transition-all duration-300">
                    {creator.name || "Unknown Creator"}
                  </span>
                  {creator.description && (
                    <span className="text-xs text-[#ff9ec6]/70 truncate group-hover:text-[#ff9ec6] transition-all duration-300">
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
