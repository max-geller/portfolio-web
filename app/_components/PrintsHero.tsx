"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Section {
  id: number;
  title: string;
  href: string;
  imageUrl: string;
}

const sections: Section[] = [
  {
    id: 1,
    title: "PRINTS",
    href: "/prints",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-cms-cc3fe.appspot.com/o/galleries%2Fcabo-san-lucas-19%2F1723515384100_DJI_0508-2.jpg?alt=media&token=385d210e-3a36-4813-9741-1078a58d9435"
  },
  
];

export default function PrintsHero() {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  let scrollTimeout: NodeJS.Timeout;

  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    }

    // Clear the previous timeout
    clearTimeout(scrollTimeout);

    // Set a new timeout
    scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 50); // Adjust this value to control the smoothness
  }, [isScrolling]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  const calculateScale = (index: number) => {
    const scrollProgress = (scrollY - index * windowHeight) * 0.0002;
    const scale = 1 + Math.max(-0.2, Math.min(0.2, scrollProgress)); // Limit scale range
    return scale;
  };

  return (
    <div className="w-screen">
      {sections.map((section, index) => (
        <Link key={section.id} href={section.href}>
          <div className="relative full-height-section overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full transform transition-all duration-700 ease-out"
              style={{
                transform: `scale(${calculateScale(index)})`,
              }}
            >
              <Image
                src={section.imageUrl}
                alt={section.title}
                fill
                quality={100}
                priority={true}
                className="object-cover"
                sizes="100vw"
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-opacity duration-300">
              <div className="flex h-full items-center justify-center">
                <h2 className="text-white text-6xl font-bold tracking-wider">
                  {section.title}
                </h2>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}