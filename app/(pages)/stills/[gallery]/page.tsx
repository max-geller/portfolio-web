"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { GalleryDocument, GalleryImage } from '@/app/types/gallery';

const categorizeImages = (images: GalleryImage[]): GalleryImage[] => {
  // Calculate average resolution for the gallery
  const resolutions = images.map(img => img.metadata?.dimensions?.width * img.metadata?.dimensions?.height || 0);
  const sortedResolutions = [...resolutions].sort((a, b) => a - b);
  
  // Define thresholds for categorization
  const lowerThird = sortedResolutions[Math.floor(resolutions.length * 0.33)];
  const upperThird = sortedResolutions[Math.floor(resolutions.length * 0.66)];

  return images.map(image => {
    const resolution = image.metadata?.dimensions?.width * image.metadata?.dimensions?.height || 0;
    let displaySize: 'small' | 'medium' | 'large' = 'medium';
    
    if (resolution <= lowerThird) displaySize = 'small';
    else if (resolution >= upperThird) displaySize = 'large';
    
    return { ...image, displaySize };
  });
};

const ImageCaption = ({ metadata }: { metadata: any }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex flex-col gap-2 text-center">
        {metadata?.camera?.make && metadata?.camera?.model && (
          <div className="text-2xl font-bold text-white [text-shadow:_2px_2px_2px_rgb(0_0_0_/_90%)]">
            📸 {`${metadata.camera.make} ${metadata.camera.model}`.trim()}
          </div>
        )}
        {metadata?.lens?.make && metadata?.lens?.model && (
          <div className="text-xl text-white [text-shadow:_2px_2px_2px_rgb(0_0_0_/_90%)]">
            🔭 {`${metadata.lens.make} ${metadata.lens.model}`.trim()}
          </div>
        )}
        <div className="flex justify-center gap-6 text-lg text-white [text-shadow:_2px_2px_2px_rgb(0_0_0_/_90%)]">
          {metadata?.settings?.shutterSpeed && (
            <span>⚡ 1/{Math.round(1/metadata.settings.shutterSpeed)}s</span>
          )}
          {metadata?.settings?.aperture && (
            <span>🎯 f/{metadata.settings.aperture}</span>
          )}
          {metadata?.settings?.iso && (
            <span>📊 ISO {metadata.settings.iso}</span>
          )}
        </div>
      </div>
    </div>
  );
};

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
        const q = query(collection(db, 'galleries'), where('slug', '==', params.gallery));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const galleryData = docSnap.data() as Omit<GalleryDocument, 'id'>;
          setGallery({ ...galleryData, id: docSnap.id });

          const imagesCollection = collection(db, 'galleries', docSnap.id, 'images');
          const imagesSnapshot = await getDocs(imagesCollection);
          const imagesData = imagesSnapshot.docs.map(doc => ({
            ...doc.data(),
            metadata: doc.data().metadata || {},
          } as GalleryImage));
          
          // Categorize images based on their dimensions
          const categorizedImages = categorizeImages(imagesData);
          setImages(categorizedImages);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[300px]">
        {images.map((image, index) => {
          const cols = image.displaySize === 'large' ? 6 : image.displaySize === 'medium' ? 4 : 3;
          
          return (
            <div
              key={index}
              className={`relative cursor-pointer group col-span-12 sm:col-span-6 lg:col-span-${cols} 
                ${image.displaySize === 'large' ? 'row-span-2' : ''}`}
              onClick={() => {
                setPhotoIndex(index);
                setIsOpen(true);
              }}
            >
              <Image
                src={image.url}
                alt={image.title || `Gallery image ${index + 1}`}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${cols * 8.33}vw`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-lg">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title && <h3 className="text-lg font-semibold">{image.title}</h3>}
                  <div className="text-sm mt-2 space-y-1">
                    {image.metadata?.camera && <div>📸 {image.metadata.camera}</div>}
                    {image.metadata?.shutterSpeed && <div>⚡ {image.metadata.shutterSpeed}</div>}
                    {image.metadata?.aperture && <div>🎯 {image.metadata.aperture}</div>}
                    {image.metadata?.iso && <div>📊 ISO {image.metadata.iso}</div>}
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
        }))}
        render={{
          caption: () => <ImageCaption metadata={images[photoIndex].metadata} />,
          iconNext: () => <span className="text-white text-4xl">→</span>,
          iconPrev: () => <span className="text-white text-4xl">←</span>,
        }}
        carousel={{
          padding: 0,
          spacing: 0,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
          captionContainer: { 
            background: "none",
            bottom: 0,
            width: "100%",
            position: "absolute",
          }
        }}
      />
    </main>
  );
}