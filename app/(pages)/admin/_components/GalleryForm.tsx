"use client";
import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { GalleryDocument, GalleryImage } from "@/app/types/gallery";

interface GalleryFormProps {
  initialData?: Partial<GalleryDocument>;
  onSubmit?: (data: GalleryDocument) => void;
}
export default function GalleryForm({
  initialData,
  onSubmit,
}: GalleryFormProps) {
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    navigation: {
      category: initialData?.navigation?.category || "stills",
      primaryCategory: initialData?.navigation?.primaryCategory || "",
      secondaryCategory: initialData?.navigation?.secondaryCategory || "",
    },
    gear: {
      cameras: initialData?.gear?.cameras || [],
      lenses: initialData?.gear?.lenses || [],
      accessories: initialData?.gear?.accessories || [],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload cover image
      let coverUrl = initialData?.photoUrl;
      if (coverImage) {
        const coverRef = ref(storage, `covers/${formData.slug}-${Date.now()}`);
        await uploadBytes(coverRef, coverImage);
        coverUrl = await getDownloadURL(coverRef);
      }

      // Create gallery document
      const galleryData: Partial<GalleryDocument> = {
        ...formData,
        photoUrl: coverUrl!,
        date: new Date(),
      };

      const docRef = await addDoc(collection(db, "galleries"), galleryData);

      // Upload gallery images
      const imagePromises = galleryImages.map(async (file, index) => {
        const imageRef = ref(
          storage,
          `galleries/${docRef.id}/${index}-${Date.now()}`
        );
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);

        // Get image dimensions for aspect ratio
        return new Promise<GalleryImage>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              url,
              title: file.name,
              aspectRatio: img.width / img.height,
              displaySize: "medium", // default size
            });
          };
          img.src = URL.createObjectURL(file);
        });
      });

      const uploadedImages = await Promise.all(imagePromises);

      // Add images to subcollection
      const imagesCollection = collection(db, "galleries", docRef.id, "images");
      await Promise.all(
        uploadedImages.map((image) => addDoc(imagesCollection, image))
      );

      onSubmit?.(galleryData as GalleryDocument);
    } catch (error) {
      console.error("Error creating gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        {/* Add more fields for description, location, etc. */}
      </div>

      {/* Navigation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Navigation</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.navigation.category}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                navigation: {
                  ...prev.navigation,
                  category: e.target.value as any,
                },
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="stills">Stills</option>
            <option value="travel">Travel</option>
            <option value="aerial">Aerial</option>
          </select>
        </div>

        {/* Add fields for primaryCategory and secondaryCategory */}
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Images</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
            required={!initialData?.photoUrl}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gallery Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryImages(Array.from(e.target.files || []))}
            className="mt-1 block w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? "Creating Gallery..." : "Create Gallery"}
      </button>
    </form>
  );
}
