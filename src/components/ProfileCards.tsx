import { dbConnect } from "@/lib/db";
import { getAllCreators } from "@/modules/creator/creatorService";
import React from "react";
import Image from "next/image";
import Link from "next/link";


const MarqueeCards = async () => {

  let creators = [];

  try {
    await dbConnect();
    creators = await getAllCreators();
  } catch (error) {
    console.error("Error fetching creators:", error);
  }

  if (creators.length === 0) {
    return (
      <div className="w-full text-center py-6 text-gray-500">
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
            className="relative h-[300px] w-[200px] rounded-2xl overflow-hidden"
          >
            {creator.imageUrl ? (
              <Image
                src={creator.imageUrl}
                alt={creator.name}
                width={200}
                height={300}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl"
                unoptimized
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                No Image
              </div>
            )}
            
            {creator.gatingEnabled ? (
              <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-white bg-red-500 rounded-tr-lg">
                Token Gated Content
              </span>
            ) : (
                <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-white bg-green-500 rounded-tr-lg">
                Public Content
              </span>
            )}
            
            <div className="absolute bottom-0 h-[60px] w-full bg-white rounded-2xl flex flex-col p-2 space-y-1">
              <div className="flex flex-row items-center space-x-2">
                <div className="rounded-full w-10 h-10 overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">?</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-black ">{creator.name || "Unknown Creator"}</span>
                  {creator.description && (
                    <span className="text-xs text-gray-600 truncate">{creator.description}</span>
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