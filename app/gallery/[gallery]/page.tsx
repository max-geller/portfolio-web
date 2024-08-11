"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase'; // Make sure this path is correct
import Image from 'next/image';

interface GalleryItem {
  id: string;
  photoUrl: string;
  title?: string;
  date?: string;
  slug: string;
}

export default function GalleryPage() {
  const params = useParams();
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        console.log("Params:", params);
        console.log("Fetching gallery item with slug:", params.gallery);
        if (typeof params.gallery === 'string') {
          const q = query(collection(db, 'galleries'), where('slug', '==', params.gallery));
          const querySnapshot = await getDocs(q);

          console.log("Query snapshot empty:", querySnapshot.empty);
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            console.log("Found document data:", data);
            setGalleryItem({
              id: docSnap.id,
              photoUrl: data.photoUrl,
              title: data.title,
              date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : undefined,
              slug: data.slug
            });
          } else {
            console.log('No such document!');
            setError('Gallery not found');
          }
        } else {
          console.log('Invalid gallery parameter:', params.gallery);
          setError('Invalid gallery parameter');
        }
      } catch (error) {
        console.error("Error fetching gallery item:", error);
        setError('An error occurred while fetching the gallery');
      }
    };

    fetchGalleryItem();
  }, [params.gallery]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!galleryItem) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">{galleryItem.title}</h1>
      <div className="relative w-full h-96">
        <Image
          src={galleryItem.photoUrl}
          alt={galleryItem.title || 'Gallery image'}
          fill
          className="object-cover"
        />
      </div>
      <p className="mt-4">{galleryItem.date}</p>
    </main>
  );
}