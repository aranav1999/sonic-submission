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
              <span className="text-[#16f195] text-[60px]">MONEY</span>.
            </span>
            <span className="text-[14px]">
              Get instant access to your favourite creators
            </span>
          </div>
          <div className="w-[70%]  flex flex-row space-x-4 items-center justify-between mt-6">
            <Link href="/creators" className="w-[50%]" passHref>
              <div className="relative border cursor-pointer border-[#122b1f] text-center rounded-md bg-gradient-to-b from-[#16f195] to-[#16f195] text-[#0e1f1a] text-[13px] font-medium tracking-wide py-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
                <span className="relative z-10">Explore Creators</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                <div className="absolute inset-0 border border-transparent rounded-md group-hover:border-[#9b5de5] transition-all duration-700"></div>
              </div>
            </Link>

            <Link href="/creator-onboarding" className="w-[50%]" passHref>
              <div className="relative border cursor-pointer border-[#122b1f] text-center rounded-md bg-gradient-to-b from-[#16f195] to-[#16f195] text-[#0e1f1a] text-[13px] font-medium tracking-wide py-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
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

      {/* How It Works Section */}
      {/* How It Works Section */}
      {/* How It Works Section - with seamless gradient transition */}
      <div className="w-full py-16 relative overflow-hidden">
        {/* Background gradient that fades in and out seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0e1f1a]/80 to-black" style={{
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)'
        }}></div>

        {/* Soft glow effects */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#16f195]/5 blur-[120px] rounded-full opacity-60"></div>
        <div className="absolute left-1/4 top-1/3 w-[50%] h-[50%] bg-[#9b5de5]/5 blur-[100px] rounded-full opacity-50"></div>
        <div className="absolute right-1/4 bottom-1/3 w-[50%] h-[50%] bg-[#16f195]/5 blur-[100px] rounded-full opacity-50"></div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <h2 className="text-center text-4xl font-bold mb-12 text-white">
            How It <span className="text-[#16f195]">Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Users Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e211c]/90 via-[#0b0f0f]/80 to-[#0e1f1a]/70 p-8 shadow-xl backdrop-blur-sm border border-[#0a0f0f]/20 transition-all duration-300 hover:shadow-2xl hover:border-[#16f195]/20 group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#16f195] opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-all duration-700"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-all duration-700"></div>

              <h3 className="text-2xl font-bold mb-6 text-[#16f195] bg-clip-text text-transparent bg-gradient-to-r from-[#16f195] to-[#16f195]/80">For Users</h3>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Discover</h4>
                    <p className="text-gray-300/90">Browse a curated selection of top creators and their exclusive posts.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Engage</h4>
                    <p className="text-gray-300/90">Immerse yourself in premium content crafted just for you.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Mint NFTs</h4>
                    <p className="text-gray-300/90">Unlock special access by minting NFTs to view hidden gems.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Creators Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e211c]/90 via-[#0b0f0f]/80 to-[#0e1f1a]/70 p-8 shadow-xl backdrop-blur-sm border border-[#0a0f0f]/20 transition-all duration-300 hover:shadow-2xl hover:border-[#16f195]/20 group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#16f195] opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-all duration-700"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#9b5de5] opacity-5 blur-[80px] rounded-full group-hover:opacity-10 transition-all duration-700"></div>

              <h3 className="text-2xl font-bold mb-6 text-[#16f195] bg-clip-text text-transparent bg-gradient-to-r from-[#16f195] to-[#16f195]/80">For Creators</h3>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Monetize</h4>
                    <p className="text-gray-300/90">Earn revenue by sharing exclusive content with your community.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Build Loyalty</h4>
                    <p className="text-gray-300/90">Grow and engage a dedicated fan base with every post.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16f195]/30 to-[#16f195]/10 flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#16f195]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Thrive</h4>
                    <p className="text-gray-300/90">Turn your passion into profit while expanding your creative influence.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/creators" passHref>
              <div className="inline-block relative border-none cursor-pointer text-center rounded-full bg-gradient-to-r from-[#16f195] to-[#49bf58] text-[#0e1f1a] text-[15px] font-medium tracking-wide py-3 px-10 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_80%)] opacity-10 transition-all duration-1000 ease-out group-hover:opacity-20 group-hover:scale-125"></div>
                <div className="absolute inset-0 border border-transparent rounded-full group-hover:border-[#9b5de5] transition-all duration-700"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>


    </>
  );
}
