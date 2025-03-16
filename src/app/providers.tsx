"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import WalletProviderWrapper from "@/utils/WalletProviderWrapper";

/**
 * This wraps the app with Redux and the Solana wallet context.
 * The actual site layout is added in src/app/layout.tsx, not here.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletProviderWrapper>{children}</WalletProviderWrapper>
    </Provider>
  );
}
