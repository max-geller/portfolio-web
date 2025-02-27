"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ClientLayout from "@/app/_layout/ClientLayout";

interface CategoryOption {
  title: string;
  slug: string;
  image: string;
}

const categories: CategoryOption[] = [
  {
    title: "Landscape",
    slug: "landscape",
    image: "https://firebasestorage.googleapis.com/v0/b/portfolio-432216.firebasestorage.app/o/temp%2FLauterbrunen-6.jpg?alt=media&token=cf9634cf-df05-4306-80f8-b79377cfb813",
  },
  {
    title: "Urban",
    slug: "urban",
    image: "https://firebasestorage.googleapis.com/v0/b/portfolio-432216.firebasestorage.app/o/temp%2FDJI_0112.jpg?alt=media&token=ad707bf7-348d-4cc7-a72d-b8dc59f034b0",
  },
  {
    title: "Creative",
    slug: "creative",
    image: "/images/categories/creative.jpg",
  },
];

export default function StillsHome() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ClientLayout>
      <main className={`min-h-screen ${isMobile ? 'flex flex-col' : 'flex flex-row'}`}>
        {categories.map((category, index) => (
          <Link
            href={`/stills/${category.slug}`}
            key={category.slug}
            className={`relative overflow-hidden group ${
              isMobile ? 'h-[33vh] w-full' : 'w-1/3 h-screen min-w-[240px]'
            }`}
          >
            <motion.div
              initial={{ scale: 1.1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes={isMobile ? "100vw" : "33vw"}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 group-hover:bg-opacity-20" />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <h2 className="text-white text-4xl font-bold tracking-wider">
                  {category.title}
                </h2>
              </motion.div>
            </motion.div>
          </Link>
        ))}
      </main>
    </ClientLayout>
  );
}
