import React from "react";

const cards = [
  { name: "Card 1", description: "This is the first card." },
  { name: "Card 2", description: "This is the second card." },
  { name: "Card 3", description: "This is the third card." },
  { name: "Card 4", description: "This is the fourth card." },
  { name: "Card 5", description: "This is the fifth card." },
];

const MarqueeCards = () => {
  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex gap-6 w-max animate-marquee">
        {[...cards, ...cards].map((card, i) => (
          <div key={i} className="nft  bg-white shadow-md rounded-lg">
            <div className="main">
              <img
                className="tokenImage w-full h-[220px] object-cover rounded-md"
                src="https://images.unsplash.com/photo-1621075160523-b936ad96132a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="NFT"
              />
              <h2 className="mt-2 text-[14px] font-semibold">{card.name}</h2>
              <p className="description text-gray-600">{card.description}</p>
              <div className="tokenInfo flex justify-between mt-2">
                <div className="price flex items-center gap-1">
                  <ins>◘</ins>
                  <p>0.031 ETH</p>
                </div>
                <div className="duration flex items-center gap-1">
                  <ins>◷</ins>
                  <p>11 days left</p>
                </div>
              </div>
              <hr className="my-1" />
              <div className="creator flex items-center gap-2">
                <div className="wrapper">
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80"
                    alt="Creator"
                  />
                </div>
                <p>
                  <ins>Creation of</ins> solana
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeCards;
