"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { GalleryDocument, GalleryImage } from "@/app/types/gallery";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const categorizeImages = (images: GalleryImage[]): GalleryImage[] => {
  return images.map((image) => {
    const width = image.metadata?.dimensions?.width ?? 1000;
    const height = image.metadata?.dimensions?.height ?? 1000;
    const aspectRatio = width / height;
    
    console.log(`Image ${image.title || 'untitled'} - Aspect ratio: ${aspectRatio}`);
    
    // Default to medium size
    let gridSpan = {
      cols: 6,  // 1/4 width
      rows: 1
    };

    // Panoramic images (very wide, aspect ratio > 2:1)
    if (aspectRatio > 2) {
      gridSpan = { cols: 12, rows: 1 }; // half width
    } 
    // Wide landscape (between 1.7 and 2)
    else if (aspectRatio >= 1.7) {
      gridSpan = { cols: 9, rows: 1 }; // 3/8 width
    }
    // Standard landscape (between 1.3 and 1.7)
    else if (aspectRatio >= 1.3) {
      gridSpan = { cols: 6, rows: 1 }; // 1/4 width
    }
    // Portrait images
    else if (aspectRatio < 0.8) {
      gridSpan = { cols: 6, rows: 2 }; // 1/4 width, double height
    }

    return { ...image, gridSpan };
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
            <span>⚡ 1/{Math.round(1 / metadata.settings.shutterSpeed)}s</span>
          )}
          {metadata?.settings?.aperture && (
            <span> f/{metadata.settings.aperture}</span>
          )}
          {metadata?.settings?.iso && <span> ISO {metadata.settings.iso}</span>}
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
        const q = query(
          collection(db, "galleries"),
          where("slug", "==", params.gallery)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const galleryData = docSnap.data() as Omit<GalleryDocument, "id">;
          setGallery({ ...galleryData, id: docSnap.id });

          const imagesCollection = collection(
            db,
            "galleries",
            docSnap.id,
            "images"
          );
          const imagesSnapshot = await getDocs(imagesCollection);
          const imagesData = imagesSnapshot.docs.map(
            (doc) =>
              ({
                ...doc.data(),
                metadata: doc.data().metadata || {},
              } as GalleryImage)
          );

          // Categorize images based on their dimensions
          const categorizedImages = categorizeImages(imagesData);
          setImages(categorizedImages);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setError("Failed to load gallery");
      }
    };

    if (params.gallery) {
      fetchGallery();
    }
  }, [params.gallery]);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts and other download methods
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + S, Ctrl/Cmd + Shift + S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (error) return <div className="text-center p-8">{error}</div>;
  if (!gallery) return <div className="text-center p-8">Loading...</div>;

  return (
    <main className="max-w-[2000px] mx-auto px-8 py-8">
      {/* Gallery Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-gray-600 mb-4">{gallery.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {gallery.location && <div>📍 {gallery.location}</div>}
          {gallery.date && (
            <div>📅 {new Date(gallery.date).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      {/* Replace your grid with ResponsiveMasonry */}
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 1000: 3, 1400: 4 }}
      >
        <Masonry gutter="1rem">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => {
                setPhotoIndex(index);
                setIsOpen(true);
              }}
            >
              <Image
                src={image.url}
                alt={image.title || `Gallery image ${index + 1}`}
                width={image.metadata?.dimensions?.width || 1000}
                height={image.metadata?.dimensions?.height || 1000}
                className="rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-lg">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {image.title && (
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                  )}
                  <div className="text-sm mt-2 space-y-1">
                    {image.metadata?.camera?.make && image.metadata?.camera?.model && (
                      <div>
                        {`${image.metadata.camera.make} ${image.metadata.camera.model}`.trim()}
                      </div>
                    )}
                    {image.metadata?.settings?.shutterSpeed && (
                      <div>
                        1/{Math.round(1 / image.metadata.settings.shutterSpeed)}s
                      </div>
                    )}
                    {image.metadata?.settings?.aperture && (
                      <div>f/{image.metadata.settings.aperture}</div>
                    )}
                    {image.metadata?.settings?.iso && (
                      <div>ISO {image.metadata.settings.iso}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={photoIndex}
        plugins={[Captions, Thumbnails, Slideshow]}
        slides={images.map((img) => ({
          src: img.url,
          title: img.title,
          description: (
            <div className="flex justify-between items-center w-full text-xs text-white p-0 m-0">
              <div className="flex-1 text-left">
                {img.metadata?.camera?.make && img.metadata?.camera?.model && (
                  <span>
                    {`${img.metadata.camera.make} ${img.metadata.camera.model}`.trim()}
                  </span>
                )}
              </div>

              <div className="flex-1 text-center">
                {img.metadata?.lens?.make && img.metadata?.lens?.model && (
                  <span>
                    {`${img.metadata.lens.make} ${img.metadata.lens.model}`.trim()}
                  </span>
                )}
              </div>

              <div className="flex-1 text-right space-x-4">
                {img.metadata?.settings?.shutterSpeed && (
                  <span>1/{Math.round(1 / img.metadata.settings.shutterSpeed)}s</span>
                )}
                {img.metadata?.settings?.aperture && (
                  <span>f/{img.metadata.settings.aperture}</span>
                )}
                {img.metadata?.settings?.iso && (
                  <span>ISO {img.metadata.settings.iso}</span>
                )}
              </div>
            </div>
          ),
        }))}
        styles={{
          root: { backgroundColor: "rgba(0, 0, 0, .9)" },
          container: { backgroundColor: "transparent" },
          toolbar: {
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          },
          slide: {
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }
        }}
        carousel={{
          padding: 0,
          spacing: 0,
        }}
        render={{
          buttonPrev: () => <span className="text-white text-4xl">←</span>,
          buttonNext: () => <span className="text-white text-4xl">→</span>,
        }}
        toolbar={{
          buttons: ['close']
        }}
      />
    </main>
  );
}
