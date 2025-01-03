"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
    title: "AERIALS",
    href: "/aerial",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/portfolio-432216.firebasestorage.app/o/galleries%2FSF%20Coit-1.jpg?alt=media&token=187b0ccc-0484-4499-b576-9f3e45e0615c",
  },
];

export default function AerialsHero() {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const initialScale = 1.1;

  const handleScroll = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = elementCenter - viewportHeight / 2;

        if (rect.top < viewportHeight && rect.bottom > 0) {
          setScrollY(distanceFromCenter);
        }
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const calculateScale = () => {
    if (!sectionRef.current) return initialScale;

    const scale = initialScale + Math.max(-0.1, Math.min(0, scrollY * 0.0005));
    return scale;
  };

  return (
    <div className="w-screen">
      <Link href={sections[0].href}>
        <div
          ref={sectionRef}
          className="relative full-height-section overflow-hidden"
        >
          <div
            className="absolute inset-0 w-full h-full transform transition-all duration-700 ease-out"
            style={{
              transform: `scale(${calculateScale()})`,
            }}
          >
            <Image
              src={sections[0].imageUrl}
              alt={sections[0].title}
              fill
              quality={100}
              priority={true}
              className="object-cover"
              sizes="100vw"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-opacity duration-300">
            <div className="flex h-full items-center justify-center">
              <h2 className="text-white text-6xl font-bold tracking-wider">
                {sections[0].title}
              </h2>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
