"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import { GalleryDocument, GalleryImageWithMetadata } from "@/app/types/gallery";
import EditGalleryForm from "@/app/(pages)/admin/_components/EditGalleryForm/EditGalleryForm";
import { toast } from "react-hot-toast";

interface EditGalleryData extends GalleryDocument {
  images?: GalleryImageWithMetadata[];
  coverImageId?: string;
}

export default function EditGalleryPage() {
  const params = useParams();
  const [gallery, setGallery] = useState<EditGalleryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const galleryDoc = await getDoc(doc(db, "galleries", params.gallery as string));
        
        if (!galleryDoc.exists()) {
          toast.error("Gallery not found");
          return;
        }

        // Fetch gallery images
        const imagesSnapshot = await getDocs(
          collection(db, "galleries", galleryDoc.id, "images")
        );
        
        const images = imagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            url: data.url,
            previewUrl: data.previewUrl,
            aspectRatio: data.aspectRatio,
            metadata: {
              camera: data.metadata?.camera,
              lens: data.metadata?.lens,
              settings: data.metadata?.settings,
              dimensions: data.metadata?.dimensions,
              datetime: data.metadata?.datetime,
              filename: data.metadata?.filename || data.metadata?.name || '',
              filesize: data.metadata?.filesize || data.metadata?.size || 0,
              type: data.metadata?.type || '',
            },
            order: data.order || 0,
          } as GalleryImageWithMetadata;
        });

        const data = galleryDoc.data();
        const galleryData: EditGalleryData = {
          id: galleryDoc.id,
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          location: data.location || '',
          date: data.date || new Date().toISOString(),
          isPublished: data.isPublished ?? true,
          navigation: {
            category: data.navigation?.category || 'stills',
            primaryCategory: data.navigation?.primaryCategory || '',
            secondaryCategory: data.navigation?.secondaryCategory || '',
          },
          gear: {
            cameras: data.gear?.cameras || [],
            lenses: data.gear?.lenses || [],
            accessories: data.gear?.accessories || [],
          },
          images,
          coverImageId: data.coverImageId
        };

        setGallery(galleryData);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        toast.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };

    if (params.gallery) {
      fetchGallery();
    }
  }, [params.gallery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!gallery || !gallery.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Gallery not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Gallery: {gallery.title}</h1>
      <EditGalleryForm galleryId={gallery.id} initialData={gallery} />
    </div>
  );
}