import React, { ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
 
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-8 relative z-10">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
