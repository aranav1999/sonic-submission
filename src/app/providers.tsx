"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import WalletProviderWrapper from "@/utils/WalletProviderWrapper";
import Layout from "@/components/Layout";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletProviderWrapper>
        {/* Layout is also a client component */}
        <Layout>{children}</Layout>
      </WalletProviderWrapper>
    </Provider>
  );
}
