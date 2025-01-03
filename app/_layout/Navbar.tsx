"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useNavigation } from "../contexts/NavigationContext";

const navLinks = [
  { id: 3, name: "AERIAL", href: "/aerial" },
  { id: 4, name: "PRINTS", href: "/prints" },
  { id: 5, name: "ABOUT", href: "/about" },
  { id: 6, name: "CONTACT", href: "contact" },
];

export default function Navbar() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const navigation = useNavigation();

  if (!navigation) return null; // Handle initial loading state

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md h-20">
      <div className="flex items-center justify-between flex-wrap py-6 px-6">
        <div className="flex items-center flex-shrink-0 mr-6">
          <Link href="/" className="pl-4 hover:text-gray-400 text-xl tracking-tight">
            MAX GELLER
          </Link>
        </div>

        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <span className="lg:flex-grow"></span>
          <div className="text-xs font-light flex items-center space-x-8">
            {/* Stills Dropdown */}
            <div className="relative group">
              <button className="pl-4 hover:text-gray-400 hover:font-normal">
                STILLS
              </button>
              
              <div className="absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-lg py-2">
                  {navigation.stills.categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Dropdown */}
            <div className="relative group">
              <button className="pl-4 hover:text-gray-400 hover:font-normal">
                TRAVEL
              </button>
              
              <div className="absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-lg py-2">
                  {Object.entries(navigation.travel).map(([region, { href, regions }]) => (
                    <div
                      key={region}
                      className="relative group/region"
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <Link 
                        href={href}
                        className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900"
                      >
                        {region}
                      </Link>

                      {hoveredRegion === region && regions.length > 0 && (
                        <div className="absolute left-full top-0 w-48 ml-0.5">
                          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-lg py-2">
                            {regions.map((subRegion) => (
                              <Link
                                key={subRegion}
                                href={`${href}/${subRegion.toLowerCase()}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                {subRegion}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="hover:text-gray-400 hover:font-normal"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
