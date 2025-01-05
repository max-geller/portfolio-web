"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { EditBasicInfo } from "./EditBasicInfo";
import { EditNavigationInfo } from "./EditNavigationInfo";
import { EditGearInfo } from "./EditGearInfo";
import { EditImageSection } from "./EditImageSection";
import { GalleryDocument, GalleryImageWithMetadata } from "@/app/types/gallery";
import { db, storage } from "@/app/firebase";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface EditGalleryFormProps {
  galleryId: string;
  initialData: GalleryDocument;
}

const baseInputStyles =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2";

export default function EditGalleryForm({
  galleryId,
  initialData,
}: EditGalleryFormProps) {
  const [formData, setFormData] = useState<GalleryDocument>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<
    GalleryImageWithMetadata[]
  >([]);
  const [coverImageId, setCoverImageId] = useState<string>(
    initialData.coverImageId || ""
  );
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.navigation.primaryCategory)
      newErrors.primaryCategory = "Primary category is required";
    if (!coverImageId) newErrors.coverImage = "Cover image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Update gallery document
      const galleryRef = doc(db, "galleries", galleryId);
      await updateDoc(galleryRef, {
        ...formData,
        coverImageId,
        updatedAt: new Date().toISOString(),
      });

      // Handle deleted images
      for (const imageId of deletedImages) {
        const imageRef = doc(db, "galleries", galleryId, "images", imageId);
        await deleteDoc(imageRef);
        // Delete from storage if needed
        const storageRef = ref(
          storage,
          `galleries/${formData.slug}/${imageId}`
        );
        try {
          await deleteObject(storageRef);
        } catch (error) {
          console.error("Error deleting image from storage:", error);
        }
      }

      // Handle new images
      const imagesCollection = collection(db, "galleries", galleryId, "images");
      for (const image of galleryImages.filter((img) => img.isNew)) {
        if (!image.file) continue;

        const storageRef = ref(
          storage,
          `galleries/${formData.slug}/${image.file.name}`
        );
        await uploadBytes(storageRef, image.file);
        const url = await getDownloadURL(storageRef);

        const imageMetadata = {
          url,
          aspectRatio: image.aspectRatio,
          metadata: image.metadata || {},
        };

        await updateDoc(doc(imagesCollection), imageMetadata);
      }

      toast.success("Gallery updated successfully!");
      router.push("/admin/manage");
    } catch (error) {
      console.error("Error updating gallery:", error);
      toast.error("Failed to update gallery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <EditBasicInfo
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          loading={loading}
          baseInputStyles={baseInputStyles}
        />

        <EditNavigationInfo
          formData={formData}
          setFormData={setFormData}
          baseInputStyles={baseInputStyles}
          errors={errors}
        />

        <EditGearInfo
          formData={formData}
          setFormData={setFormData}
          baseInputStyles={baseInputStyles}
        />

        <EditImageSection
          galleryImages={galleryImages}
          setGalleryImages={setGalleryImages}
          coverImageId={coverImageId}
          setCoverImageId={setCoverImageId}
          setDeletedImages={setDeletedImages}
          gallerySlug={formData.slug}
        />

        <div className="mt-8 flex justify-end pb-8">
          <button
            type="submit"
            disabled={loading}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
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
                Updating Gallery...
              </>
            ) : (
              "Update Gallery"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
