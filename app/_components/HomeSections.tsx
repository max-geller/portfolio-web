"use client";
import React, { useEffect, useState } from "react";
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
    title: "TRAVEL",
    href: "/travel",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-cms-cc3fe.appspot.com/o/galleries%2Fcabo-san-lucas-19%2F1723515384100_DJI_0508-2.jpg?alt=media&token=385d210e-3a36-4813-9741-1078a58d9435"
, 
  },
  {
    id: 2,
    title: "STILLS",
    href: "/stills",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-432216.firebasestorage.app/o/galleries%2FLauterbrunen-5.jpg?alt=media&token=c0aef1dd-b5cd-4e3c-ad36-2ecd6a255030"
,
  },
  {
    id: 3,
    title: "AERIAL",
    href: "/aerial",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-432216.firebasestorage.app/o/galleries%2FSF%20Coit-1.jpg?alt=media&token=187b0ccc-0484-4499-b576-9f3e45e0615c"
,
  },
  {
    id: 4,
    title: "PRINTS",
    href: "/prints",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/portfolio-cms-cc3fe.appspot.com/o/galleries%2Fcabo-san-lucas-19%2F1723515384086_DJI_0493-2.jpg?alt=media&token=5a8da649-052a-495e-84ff-8e6e60f7e021"
,
  },
];

export default function HomeSections() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full">
      {sections.map((section, index) => (
        <Link key={section.id} href={section.href}>
          <div className="relative h-screen w-full overflow-hidden">
            <div
              className="absolute inset-0 transform transition-transform duration-300"
              style={{
                transform: `scale(${1 + (scrollY - index * window.innerHeight) * 0.0002})`,
              }}
            >
              <Image
                src={section.imageUrl}
                alt={section.title}
                fill
                className="object-cover"
                priority={index === 0}
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