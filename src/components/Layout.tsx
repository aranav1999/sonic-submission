import { ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto  relative z-10">
        {children}
      </main>

      <Footer/>
    </div>
  );
}
