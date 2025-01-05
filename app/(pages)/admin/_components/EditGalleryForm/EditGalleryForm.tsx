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
  addDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface EditGalleryFormProps {
  galleryId: string;
  initialData: GalleryDocument & { images: GalleryImageWithMetadata[]; coverImageId?: string };
}

const baseInputStyles =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2";

export function EditGalleryForm({ galleryId, initialData }: EditGalleryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<GalleryDocument>(initialData);
  const [galleryImages, setGalleryImages] = useState<GalleryImageWithMetadata[]>(initialData.images || []);
  const [coverImageId, setCoverImageId] = useState<string>(initialData.coverImageId || '');
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This useEffect ensures the form data stays in sync with initialData
  useEffect(() => {
    setFormData(initialData);
    setGalleryImages(initialData.images || []);
    setCoverImageId(initialData.coverImageId || '');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update gallery document
      const galleryRef = doc(db, "galleries", galleryId);
      await updateDoc(galleryRef, {
        ...formData,
        coverImageId,
        updatedAt: new Date().toISOString()
      });

      // Handle deleted images
      for (const imageId of deletedImages) {
        // Delete from storage
        const imageRef = ref(storage, `galleries/${formData.slug}/${imageId}`);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image from storage:", error);
        }
        // Delete from Firestore
        await deleteDoc(doc(db, "galleries", galleryId, "images", imageId));
      }

      // Handle new images
      const newImages = galleryImages.filter(img => img.isNew);
      for (const image of newImages) {
        if (image.file) {
          const storageRef = ref(storage, `galleries/${formData.slug}/${image.id}`);
          await uploadBytes(storageRef, image.file);
          const url = await getDownloadURL(storageRef);

          await addDoc(collection(db, "galleries", galleryId, "images"), {
            url,
            previewUrl: url,
            aspectRatio: image.aspectRatio,
            metadata: image.metadata,
            order: image.order
          });
        }
      }

      toast.success("Gallery updated successfully");
      router.push('/admin/manage');
    } catch (error) {
      console.error("Error updating gallery:", error);
      toast.error("Failed to update gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <EditBasicInfo
        formData={formData}
        setFormData={setFormData}
        baseInputStyles={baseInputStyles}
      />
      
      <EditNavigationInfo
        formData={formData}
        setFormData={setFormData}
        baseInputStyles={baseInputStyles}
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

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/manage')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
