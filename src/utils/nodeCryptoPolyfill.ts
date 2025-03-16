if (typeof window !== "undefined" && !("nodeCrypto" in globalThis)) {
  (globalThis as any).nodeCrypto = window.crypto;
}
