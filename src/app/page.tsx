import MarqueeCards from "@/components/ProfileCards";
import Image from "next/image";
import Link from "next/link";
import media from "../../public/images/index";

export default function Home() {
  return (
    <>
      <div className="w-full flex flex-row h-[calc(100vh-95px)] items-center">
        {/* Left Content */}
        <div className="w-[50%] flex flex-col ">
          <div className="flex flex-col  -space-y-2">
            {" "}
            <span className="text-[40px] font-medium">
              Attention is{" "}
              <span className="text-[#6b3fa0] text-[60px]">MONEY</span>.
            </span>
            <span className="text-[14px]">
              Get instant access to your favourite creators
            </span>
          </div>
          <div className="w-[70%]  flex flex-row space-x-4 items-center justify-between mt-6">
            <Link href="/creators" className="w-[50%]" passHref>
              <div className="relative border cursor-pointer border-[#6b3fa0] text-center rounded-md bg-gradient-to-b from-[#1a0b25] to-[#3a1c5c] text-gray-300 text-[13px] font-medium tracking-wide py-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
                <span className="relative z-10">Explore Creators</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                <div className="absolute inset-0 border border-transparent rounded-md group-hover:border-[#9b5de5] transition-all duration-700"></div>
              </div>
            </Link>

            <Link href="/creator-onboarding" className="w-[50%]" passHref>
              <div className="relative border cursor-pointer border-[#6b3fa0] text-center rounded-md bg-gradient-to-b from-[#1a0b25] to-[#3a1c5c] text-gray-300 text-[13px] font-medium tracking-wide py-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
                <span className="relative z-10">Get Paid to Exist</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                <div className="absolute inset-0 border border-transparent rounded-md group-hover:border-[#9b5de5] transition-all duration-700"></div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Image with Blending Effect */}
        <div className="w-[50%] h-[80%] relative p-2 flex items-center justify-center">
          <div className="w-full h-full relative overflow-hidden rounded-lg">
            {/* Background Blur Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-40 blur-3xl"></div>

            {/* Image with Soft Edge Mask */}
            <Image
              src={media?.homeBg}
              alt=".."
              className="object-cover w-full h-full rounded-lg"
              fill
              style={{
                maskImage:
                  "radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage:
                  "radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <MarqueeCards />
    </>
  );
}
