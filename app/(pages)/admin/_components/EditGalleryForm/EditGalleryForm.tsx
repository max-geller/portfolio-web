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

  return (
    <div className="space-y-8">
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

      {/* Rest of your form */}
    </div>
  );
}
