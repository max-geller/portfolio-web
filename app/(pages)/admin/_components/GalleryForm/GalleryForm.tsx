"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { BasicInfo } from "./BasicInfo";
import { NavigationInfo } from "./NavigationInfo";
import { GearInfo } from "./GearInfo";
import { ImageUploadSection } from "./ImageUploadSection";
import { PublishControls } from "./PublishControls";
import { GalleryDocument, GalleryImageWithMetadata } from "@/app/types/gallery";
import { db, storage } from "@/app/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface GalleryFormProps {
  initialData?: Partial<GalleryDocument>;
  onSubmit?: (data: GalleryDocument) => void;
}

const baseInputStyles =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

const initialFormState: GalleryDocument = {
  title: "",
  slug: "",
  description: "",
  location: "",
  date: new Date().toISOString(),
  isPublished: false,
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
  const [galleryImages, setGalleryImages] = useState<
    GalleryImageWithMetadata[]
  >([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);

  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = "Title is required";
    }
    if (!formData.slug) {
      newErrors.slug = "Slug is required";
    }
    if (!coverImageId) {
      newErrors.coverImage = "Cover image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    setLoading(true);

    try {
      // Your form submission logic here

      toast.success("Gallery created successfully!");
      router.push("/admin/galleries");
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
          primaryCategoryOptions={{
            stills: ["Nature", "Portrait", "Street"],
            travel: ["Cities", "Landscapes", "Culture"],
            aerial: ["Drone", "Helicopter", "Airplane"],
          }}
          baseInputStyles={baseInputStyles}
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
