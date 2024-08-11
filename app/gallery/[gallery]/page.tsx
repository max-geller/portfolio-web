"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  photoUrl: string;
  title?: string;
  date?: string;
  slug: string;
  images?: string[];
}

export default function GalleryPage() {
  const params = useParams();
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        if (typeof params.gallery === 'string') {
          const q = query(collection(db, 'galleries'), where('slug', '==', params.gallery));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            
            // Fetch images subcollection
            const imagesCollection = collection(db, 'galleries', docSnap.id, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            const images = imagesSnapshot.docs.map(doc => doc.data().photoUrl);

            setGalleryItem({
              id: docSnap.id,
              photoUrl: data.photoUrl,
              title: data.title,
              date: data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : undefined,
              slug: data.slug,
              images: images
            });
          } else {
            setError('Gallery not found');
          }
        } else {
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
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      <h1 className="text-4xl font-bold mb-8">{galleryItem.title}</h1>
      <p className="mb-8">{galleryItem.date}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {galleryItem.images?.map((imageUrl, index) => (
          <div key={index} className="relative aspect-[3/2]">
            <Image
              src={imageUrl}
              alt={`Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </main>
  );
}