"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { BasicInfo } from "./BasicInfo";
import { NavigationInfo } from "./NavigationInfo";
import { GearInfo } from "./GearInfo";
import { ImageUploadSection } from "./ImageUploadSection";
import { GalleryDocument, GalleryImageWithMetadata } from "@/app/types/gallery";
import { db, storage } from "@/app/firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface GalleryFormProps {
  initialData?: Partial<GalleryDocument>;
  onSubmit?: (data: GalleryDocument) => void;
}

const baseInputStyles =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2";

const initialFormState: GalleryDocument = {
  title: "",
  slug: "",
  description: "",
  location: "",
  date: new Date().toISOString(),
  isPublished: true,
  navigation: {
    category: "stills",
    primaryCategory: "",
    secondaryCategory: "",
  },
  gear: {
    cameras: [],
    lenses: [],
    accessories: [],
  },
};

export default function GalleryForm({
  initialData,
  onSubmit,
}: GalleryFormProps) {
  const [formData, setFormData] = useState<GalleryDocument>(
    initialData ? { ...initialFormState, ...initialData } : initialFormState
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [manualYearOverride, setManualYearOverride] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImageWithMetadata[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);

  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.navigation.primaryCategory) newErrors.primaryCategory = "Primary category is required";
    if (!coverImageId) newErrors.coverImage = "Cover image is required";
    if (galleryImages.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (image: GalleryImageWithMetadata) => {
    if (!image.file) return null;

    const storageRef = ref(storage, `galleries/${formData.slug}/${image.file.name}`);
    await uploadBytes(storageRef, image.file);
    const url = await getDownloadURL(storageRef);

    return {
      url,
      aspectRatio: image.aspectRatio,
      metadata: image.metadata || {},
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Check if slug exists by trying to get the document directly
      const galleryDoc = doc(db, "galleries", formData.slug);
      const gallerySnapshot = await getDoc(galleryDoc);
      
      if (gallerySnapshot.exists() && !initialData?.id) {
        setErrors({ slug: "This slug already exists" });
        toast.error("Slug already exists");
        return;
      }

      // Upload images
      const uploadPromises = galleryImages.map(uploadImage);
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter((img): img is NonNullable<typeof img> => img !== null);

      // Find the selected cover image from original gallery images
      const selectedCoverImage = galleryImages.find(img => img.previewUrl === coverImageId);
      
      if (!selectedCoverImage) {
        toast.error("Please select a cover image");
        return;
      }

      // Find the corresponding uploaded image
      const coverImage = validImages[galleryImages.indexOf(selectedCoverImage)];

      if (!coverImage) {
        toast.error("Failed to process cover image");
        return;
      }

      // Create/Update gallery document using slug as ID
      const galleryRef = doc(db, "galleries", formData.slug);

      await setDoc(galleryRef, {
        ...formData,
        photoUrl: coverImage.url,
        updatedAt: new Date().toISOString(),
        createdAt: initialData?.id ? initialData.createdAt : new Date().toISOString(),
      });

      // Add images to subcollection
      const imagesCollection = collection(db, "galleries", formData.slug, "images");
      
      for (const image of validImages) {
        const imageMetadata = {
          url: image.url,
          aspectRatio: image.aspectRatio,
          isCover: image.url === coverImage.url,
          metadata: image.metadata ? {
            camera: image.metadata.camera ? {
              make: image.metadata.camera.make,
              model: image.metadata.camera.model
            } : null,
            lens: image.metadata.lens ? {
              make: image.metadata.lens.make,
              model: image.metadata.lens.model
            } : null,
            settings: image.metadata.settings ? {
              aperture: image.metadata.settings.aperture,
              shutterSpeed: image.metadata.settings.shutterSpeed,
              iso: image.metadata.settings.iso,
              focalLength: image.metadata.settings.focalLength
            } : null,
            dimensions: image.metadata.dimensions || null,
            datetime: image.metadata.datetime || null
          } : null
        };

        await addDoc(imagesCollection, imageMetadata);
      }

      toast.success(initialData?.id ? "Gallery updated successfully!" : "Gallery created successfully!");
      router.push("/admin/manage");
    } catch (error) {
      console.error("Error creating gallery:", error);
      toast.error("Failed to create gallery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfo
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          manualYearOverride={manualYearOverride}
          setManualYearOverride={setManualYearOverride}
          isCheckingSlug={isCheckingSlug}
          loading={loading}
          baseInputStyles={baseInputStyles}
        />

        <NavigationInfo
          formData={formData}
          setFormData={setFormData}
          baseInputStyles={baseInputStyles}
          errors={errors}
        />

        <GearInfo
          formData={formData}
          setFormData={setFormData}
          baseInputStyles={baseInputStyles}
        />

        <ImageUploadSection
          galleryImages={galleryImages}
          setGalleryImages={setGalleryImages}
          coverImageId={coverImageId}
          setCoverImageId={setCoverImageId}
        />

        <div className="mt-8 flex justify-end pb-8">
          <button
            type="submit"
            disabled={loading || isCheckingSlug}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                loading || isCheckingSlug
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }
            `}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Gallery...
              </>
            ) : (
              "Create Gallery"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
