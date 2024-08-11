

"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/firebase";

interface GalleryItem {
  id: string;
  photoUrl: string;
  title?: string;
  date?: string;
  slug: string;
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      // Create a query with orderBy
      const q = query(collection(db, "galleries"), orderBy("date", "desc"));
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          photoUrl: data.photoUrl,
          title: data.title,
          date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : undefined,
          slug: data.slug
        } as GalleryItem;
      });
      
      setGalleryItems(items);
    };
    

    fetchGalleryItems();
  }, []);

  
  return (
    <div className="w-full">
      <div className="mx-auto max-w-9xl px-0 sm:px-2 md:px-3 lg:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0">
          {galleryItems.map((item, index) => (
            <Link key={item.id} href={`/gallery/${item.slug}`}>
              <div className="aspect-square bg-gray-200 relative group cursor-pointer">
                <Image
                  src={item.photoUrl}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1536px) 33vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <h3 className="text-white text-xl font-bold">{item.title || "TITLE"}</h3>
                  <p className="text-white">{item.date || "DATE"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}