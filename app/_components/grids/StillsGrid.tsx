"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, query, orderBy, where, and } from "firebase/firestore";
import { db } from "@/app/firebase";
import { GalleryDocument, NavigationCategory } from "@/app/types/gallery";

interface StillsGridProps {
  category: string;
}

export default function StillsGrid({ category }: StillsGridProps) {
  const [stillItems, setStillItems] = useState<GalleryDocument[]>([]);

  useEffect(() => {
    const fetchStillItems = async () => {
      const q = query(
        collection(db, "galleries"),
        and(
          where("navigation.category", "==", "stills"),
          where("navigation.primaryCategory", "==", category),
          where("isPublished", "==", true)
        ),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          location: data.location || '',
          date: data.date?.toDate().toISOString() || '',
          photoUrl: data.photoUrl || '',
          navigation: {
            category: data.navigation?.category || 'stills' as NavigationCategory,
            primaryCategory: data.navigation?.primaryCategory || '',
            secondaryCategory: data.navigation?.secondaryCategory || ''
          },
          isPublished: data.isPublished || false,
          gear: {
            cameras: data.gear?.cameras || [],
            lenses: data.gear?.lenses || [],
            accessories: data.gear?.accessories || []
          }
        } as GalleryDocument;
      });

      setStillItems(items);
    };

    fetchStillItems();
  }, [category]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-9xl px-0 sm:px-2 md:px-3 lg:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0">
          {stillItems.map((item) => (
            <Link key={item.id} href={`/stills/${item.slug}`}>
              <div className="aspect-square bg-gray-200 relative group cursor-pointer">
                <Image
                  src={item.photoUrl || '/images/placeholder.jpg'}
                  alt={item.title || 'Gallery image'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, (max-width: 1536px) 33vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <h3 className="text-white text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="text-white">
                    {item.date ? new Date(item.date).toLocaleDateString() : ''}
                  </p>
                  {item.location && (
                    <p className="text-white text-sm mt-1">
                      {item.location}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
