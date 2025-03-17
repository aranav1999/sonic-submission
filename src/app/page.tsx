import MarqueeCards from "@/components/ProfileCards";
import Image from "next/image";
import Link from "next/link";
import media from  "../../public/images/index"
export default function Home() {
  return (
    <>
      <div className="w-full flex flex-row h-[500px] items-center ">
        <div className=" w-[60%] flex flex-col">
          <span className="text-[40px] font-medium">
            Attention is <span className="text-[#6b3fa0] text-[60px]">MONEY</span>.
          </span>
          <span className="text-[14px]">
            Get instant access to your favourite creators
          </span>
          <div className="w-[70%] h-fit flex flex-row space-x-4 items-center justify-between mt-4">
            <Link href="/creators"  className="w-[50%]" passHref>
              <div className="relative  border cursor-pointer border-[#6b3fa0] text-center rounded-md bg-gradient-to-b from-[#1a0b25] to-[#3a1c5c] text-gray-300 text-[13px] font-medium tracking-wide py-1 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
                <span className="relative z-10">Explore Creators</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                <div className="absolute inset-0 border border-transparent rounded-md group-hover:border-[#9b5de5] transition-all duration-700"></div>
              </div>
            </Link>
            <div className="relative w-[50%] border cursor-pointer border-[#6b3fa0] text-center rounded-md bg-gradient-to-b from-[#1a0b25] to-[#3a1c5c] text-gray-300 text-[13px] font-medium tracking-wide py-1 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
              <span className="relative z-10">Get Paid to Exist</span>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>

              <div className="absolute inset-0 border border-transparent rounded-md group-hover:border-[#9b5de5] transition-all duration-700"></div>
            </div>
          </div>
        </div>
        <div className="w-[40%] h-[400px] relative  rounded-lg p-2">
          <div className="w-full h-full ">
            <Image src={media?.homeBg} alt=".." objectFit="contain " fill />
          </div>
        </div>
      </div>

      <MarqueeCards />
    </>
  );
}
