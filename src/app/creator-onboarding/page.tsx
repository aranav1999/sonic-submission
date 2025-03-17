import CreatorOnboardingForm from "./CreatorOnboardingForm";

export default function CreatorOnboardingPage() {
  return (
    <div className="relative w-full min-h-screen py-12 px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-[#1f151c]/80 to-black opacity-80"></div>
        <div className="absolute left-1/4 top-1/3 w-[60%] h-[60%] bg-[#ff9ec6]/5 blur-[150px] rounded-full opacity-60"></div>
        <div className="absolute right-1/3 bottom-1/4 w-[40%] h-[40%] bg-[#9b5de5]/5 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute left-1/2 top-1/2 w-[70%] h-[70%] bg-[#ff7eb6]/5 blur-[100px] rounded-full opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Creator <span className="text-[#ff9ec6]">Onboarding</span>
        </h1>
        <p className="text-[#ff9ec6]/70 max-w-2xl mx-auto">
          Fill out your details to become a creator on the platform and start sharing your exclusive content with your audience.
        </p>
      </div>
      
      <CreatorOnboardingForm />
    </div>
  );
}
