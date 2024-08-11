"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface GalleryImage {
  url: string;
  aspectRatio: number;
}

interface GalleryItem {
  id: string;
  photoUrl: string;
  title?: string;
  date?: string;
  slug: string;
  images?: GalleryImage[];
}

export default function GalleryPage() {
  const params = useParams();
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

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
            const images = imagesSnapshot.docs.map(doc => ({
              url: doc.data().photoUrl,
              aspectRatio: doc.data().aspectRatio || 1 // Default to 1 if not available
            }));

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
        {galleryItem.images?.map((image, index) => (
          <div 
            key={index} 
            className="relative w-full cursor-pointer"
            style={{
              paddingBottom: `${(1 / image.aspectRatio) * 100}%`,
            }}
            onClick={() => {
              setPhotoIndex(index);
              setIsOpen(true);
            }}
          >
            <Image
              src={image.url}
              alt={`Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover absolute top-0 left-0 w-full h-full"
            />
          </div>
        ))}
      </div>
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={photoIndex}
        slides={galleryItem.images?.map(img => ({ src: img.url })) || []}
      />
    </main>
  );
}