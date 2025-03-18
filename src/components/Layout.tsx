import { ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Texture overlay with increased opacity */}

      <Header />
      <main className="flex-grow w-full mx-auto relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
