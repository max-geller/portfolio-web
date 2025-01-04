"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { GalleryDocument, GalleryImage } from '@/app/types/gallery';

export default function StillsGalleryPage() {
  const params = useParams();
  const [gallery, setGallery] = useState<GalleryDocument | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // Fetch gallery document
        const q = query(collection(db, 'galleries'), where('slug', '==', params.gallery));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const galleryData = docSnap.data() as Omit<GalleryDocument, 'id'>;
          setGallery({ ...galleryData, id: docSnap.id });

          // Fetch images subcollection
          const imagesCollection = collection(db, 'galleries', docSnap.id, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          const imagesData = imagesSnapshot.docs.map(doc => ({
            ...doc.data(),
            displaySize: doc.data().displaySize || 'small',
            title: doc.data().title || '',
            caption: doc.data().caption || '',
          } as GalleryImage));
          setImages(imagesData);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setError('Failed to load gallery');
      }
    };

    if (params.gallery) {
      fetchGallery();
    }
  }, [params.gallery]);

  if (error) return <div className="text-center p-8">{error}</div>;
  if (!gallery) return <div className="text-center p-8">Loading...</div>;

  return (
    <main className="max-w-8xl mx-auto px-4 py-8">
      {/* Gallery Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-gray-600 mb-4">{gallery.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {gallery.location && (
            <div>📍 {gallery.location}</div>
          )}
          {gallery.date && (
            <div>📅 {new Date(gallery.date).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      {/* Equipment Used */}
      {gallery.gear && Object.keys(gallery.gear).length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(gallery.gear.cameras) && gallery.gear.cameras.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Cameras</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {gallery.gear.cameras.map((camera, i) => (
                    <li key={i}>{camera}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(gallery.gear.lenses) && gallery.gear.lenses.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Lenses</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {gallery.gear.lenses.map((lens, i) => (
                    <li key={i}>{lens}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(gallery.gear.accessories) && gallery.gear.accessories.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Accessories</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {gallery.gear.accessories.map((accessory, i) => (
                    <li key={i}>{accessory}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-12 gap-4">
        {images.map((image, index) => {
          const cols = image.displaySize === 'large' ? 6 : image.displaySize === 'medium' ? 4 : 3;
          const rows = image.gridSpan?.rows || 1;

          return (
            <div
              key={index}
              className={`col-span-${cols} row-span-${rows} relative cursor-pointer group`}
              style={{
                aspectRatio: image.aspectRatio,
              }}
              onClick={() => {
                setPhotoIndex(index);
                setIsOpen(true);
              }}
            >
              <Image
                src={image.url}
                alt={image.title || `Gallery image ${index + 1}`}
                fill
                className="object-cover"
                sizes={`(max-width: 768px) 100vw, ${cols * 8.33}vw`}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title && <h3 className="text-lg font-semibold">{image.title}</h3>}
                  {image.caption && <p className="text-sm">{image.caption}</p>}
                  <div className="text-xs mt-2">
                    {image.camera && <span className="mr-3">{image.camera}</span>}
                    {image.shutterSpeed && <span className="mr-3">{image.shutterSpeed}</span>}
                    {image.aperture && <span className="mr-3">{image.aperture}</span>}
                    {image.iso && <span>ISO {image.iso}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={photoIndex}
        slides={images.map(img => ({
          src: img.url,
          title: img.title || '',
          description: img.caption || ''
        }))}
      />
    </main>
  );
}