"use client";
import React from "react";
import Link from "next/link";

export default function Gallery() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="aspect-square bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
