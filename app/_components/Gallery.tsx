"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Gallery() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="aspect-square bg-gray-200 relative">
          <Image
            src="https://images.pexels.com/photos/27439406/pexels-photo-27439406/free-photo-of-a-cup-of-coffee-sits-on-a-bed-with-pillows.jpeg"
            alt="Travel image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="aspect-square bg-gray-200 relative">
          <Image
            src="https://images.pexels.com/photos/27354543/pexels-photo-27354543/free-photo-of-two-buildings-with-balconies-and-windows-in-the-city.jpeg"
            alt="Travel image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="aspect-square bg-gray-200 relative">
          <Image
            src="https://images.pexels.com/photos/26937707/pexels-photo-26937707/free-photo-of-washoe-lake-wild-horses.jpeg"
            alt="Travel image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        {[...Array(11)].map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 flex items-center justify-center"
          >
            <span className="text-gray-500">Image {index + 2}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
