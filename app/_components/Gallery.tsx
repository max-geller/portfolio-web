"use client";
import React from "react";
import Image from "next/image";

export default function Gallery() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-9xl px-0 sm:px-2 md:px-3 lg:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0">
          {[...Array(14)].map((_, index) => (
            <div key={index} className="aspect-square bg-gray-200 relative group">
              {index < 3 ? (
                <Image
                  src={`https://images.pexels.com/photos/${2433985 + index}/pexels-photo-${2433985 + index}.jpeg`}
                  alt={`Travel image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1536px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Image {index + 1}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <h3 className="text-white text-xl font-bold">TITLE</h3>
                <p className="text-white">DATE</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}