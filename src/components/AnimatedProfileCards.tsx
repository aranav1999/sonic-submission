"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";

interface Creator {
  _id?: string;
  imageUrl?: string;
  name?: string;
  description?: string;
  gatingEnabled?: boolean;
}

interface AnimatedProfileCardsProps {
  creators?: Creator[];
}

const AnimatedProfileCards: React.FC<AnimatedProfileCardsProps> = ({
  creators = [],
}) => {
  const [selectedCreators, setSelectedCreators] = useState<Creator[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Display up to 8 random creators
  useEffect(() => {
    if (creators.length > 0) {
      const shuffled = [...creators].sort(() => 0.5 - Math.random());
      setSelectedCreators(shuffled.slice(0, 8));
    }
  }, [creators]);

  // Predefined positions for each card
  const positions = [
    { x: "0%", y: "0%", scale: 1, rotation: -15 },
    { x: "140%", y: "20%", scale: 1, rotation: 20 },
    { x: "70%", y: "80%", scale: 1, rotation: 0 },
    { x: "200%", y: "60%", scale: 1, rotation: -10 },
    { x: "110%", y: "160%", scale: 1, rotation: 15 },
    { x: "0%", y: "150%", scale: 1, rotation: 5 },
    { x: "210%", y: "0%", scale: 1, rotation: -20 },
    { x: "40%", y: "180%", scale: 1, rotation: 10 },
  ];

  // Card animation variants
  const cardVariants = {
    hidden: {
      scale: 0.2,
      opacity: 0,
      filter: "brightness(0.8) blur(10px)",
      x: "50%",
      y: "50%",
      rotate: 0,
    },
    visible: (i: number) => ({
      scale: positions[i].scale,
      opacity: 1,
      filter: "brightness(0.8) blur(0px)",
      x: positions[i].x,
      y: positions[i].y,
      rotate: positions[i].rotation,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: i * 0.08,
      },
    }),
    hover: {
      scale: 1.1,
      zIndex: 10,
      boxShadow: "0 0 20px rgba(26, 176, 113, 0.6)",
      filter: "brightness(1.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
    drag: {
      scale: 1.15,
      zIndex: 20,
      boxShadow: "0 0 40px rgba(26, 176, 113, 0.8)",
      filter: "brightness(1.2)",
    },
  };

  // === Mouse-driven Tilt / Parallax Effect ===
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      const yPos = e.clientY - rect.top;
      setMouse({ x: xPos - rect.width / 2, y: yPos - rect.height / 2 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const rotateX = useTransform(useMotionValue(mouse.y), [-200, 200], [8, -8]);
  const rotateY = useTransform(useMotionValue(mouse.x), [-200, 200], [-8, 8]);

  // === Scroll-driven Parallax Effect for Background Overlays ===
  const { scrollY } = useScroll();
  const bgOverlay1Y = useTransform(scrollY, [0, 500], [0, -50]);
  const bgOverlay2Y = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-[600px] h-[600px] md:w-[700px] md:h-[700px]"
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
      }}
    >
      {/* Background overlays with scroll parallax */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-[#1ab071]/10 blur-[120px] top-[30%] left-[20%] pointer-events-none"
        style={{ y: bgOverlay1Y }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full bg-[#9b5de5]/10 blur-[100px] bottom-[20%] right-[30%] pointer-events-none"
        style={{ y: bgOverlay2Y }}
      />

      {/* Render each interactive card */}
      {selectedCreators.map((creator, i) => (
        <motion.div
          key={`${creator._id}-${i}`}
          className="absolute w-[200px] h-[300px] cursor-pointer"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileDrag="drag"
          whileTap={{ scale: 0.95 }}
          variants={cardVariants}
          custom={i}
          drag
          dragSnapToOrigin={false}
          dragConstraints={containerRef}
          dragElastic={0.3}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative h-full w-full rounded-2xl overflow-hidden group transition-all duration-300 transform hover:scale-105">
            {creator.imageUrl ? (
              <Image
                src={creator.imageUrl}
                alt={creator.name || "Creator Image"}
                width={200}
                height={300}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl pointer-events-none group-hover:brightness-110 transition-all duration-300"
                unoptimized
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0e1f1a] rounded-2xl">
                <span className="text-[#1ab071]">No Image</span>
              </div>
            )}

            {creator.gatingEnabled ? (
              <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#0e1f1a] bg-[#1ab071] rounded-tr-lg z-10">
                Token Gated
              </span>
            ) : (
              <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-semibold text-[#1ab071] bg-[#0e1f1a] rounded-tr-lg z-10">
                Public
              </span>
            )}

            <div className="absolute bottom-0 h-[60px] w-full bg-[#0e1f1a] rounded-b-2xl flex flex-col p-2 space-y-1 transition-all duration-300 group-hover:h-[70px] z-10">
              <div className="flex flex-row items-center space-x-2">
                <div className="rounded-full w-10 h-10 overflow-hidden border-2 border-[#1ab071] transition-all duration-300">
                  {creator.imageUrl ? (
                    <Image
                      src={creator.imageUrl}
                      alt={creator.name || "Creator Avatar"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full pointer-events-none"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1ab071] rounded-full">
                      <span className="text-[#0e1f1a]">?</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white transition-all duration-300">
                    {creator.name || "Unknown Creator"}
                  </span>
                  {creator.description && (
                    <span className="text-xs text-[#1ab071]/70 truncate transition-all duration-300">
                      {creator.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedProfileCards;
