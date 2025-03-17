import MarqueeCards from "@/components/ProfileCards";

export default function Home() {
  return (
  <>
  
  <div >
      <h1>Welcome to NFT OnlyFans MVP!</h1>
      <p>
        This is a home page. Use the <strong>Connect Wallet</strong> button in
        the top navigation to connect your Phantom Wallet (or another Solana
        wallet).
      </p>
      <p>
        Once connected, feel free to explore the <strong>Dashboard</strong> to
        mint or trade NFTs, or visit the <strong>OnlyFans</strong> page to tip
        or buy special NFTs.
      </p>
    </div>
    <MarqueeCards/> 
    </>




  );
}
