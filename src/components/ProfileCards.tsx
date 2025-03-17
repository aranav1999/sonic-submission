// import Image from "next/image";
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
      <div className="flex space-x-4 w-max animate-marquee ">
        {[...cards, ...cards].map((card, i) => (
          <div
            key={i}
            className="rounded-lg  h-[300px] w-[250px] border shadow-lg flex flex-col justify-between items-center p-4 text-center"
          >


            <div className="h-full  w-full rounded-lg">
{/* <Image src={} alt="jj"/> */}
            </div>
            <div className="flex flex-col "><h3 className="text-lg font-semibold ">{card.name}</h3>
            <p className="text-sm text-gray-600">{card.description}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeCards;
