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
    <div className="w-full py-6 px-4 ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Discover Creators</h1>
        <p className="text-gray-600 mt-2">
          Explore talented creators sharing their unique digital art and
          collectibles
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10 text-gray-500">
          <p>No creators found. Be the first to join our community!</p>
          <Link
            href="/creator-onboarding"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Become a Creator
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creators.map((creator: ICreator) => (
            <Link
              href={`/creator/${creator._id?.toString()}`}
              key={creator._id?.toString()}
              className="relative h-[300px] w-[200px] rounded-2xl  overflow-hidden"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 rounded-2xl">
                    No Image
                  </div>
                )}
              </div>
              {creator.gatingEnabled ? (
                <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-white bg-red-500 rounded-tr-lg">
                  Token Gated Content
                </span>
              ) : (
                <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-white bg-green-500 rounded-tr-lg">
                  Public Content
                </span>
              )}
              <div className="absolute bottom-0 h-[70px] w-full rounded-2xl border flex flex-row items-center p-2 space-x-2 bg-white">
                <div className="rounded-full w-10 h-10 border overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 rounded-full">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-black">{creator.name || "Unknown Creator"}</span>
                  <span className="text-xs text-gray-600">{creator.description || "No description available"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}