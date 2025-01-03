"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { GalleryDocument, GalleryImage } from "@/app/types/gallery";

// Add type for navigation category
type NavigationCategory = "stills" | "travel" | "aerial";

interface GalleryFormProps {
  initialData?: Partial<GalleryDocument>;
  onSubmit?: (data: GalleryDocument) => void;
}

interface FormErrors {
  title?: string;
  slug?: string;
  coverImage?: string;
  primaryCategory?: string;
}

interface CachedSlug {
  isAvailable: boolean;
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached slugs

export default function GalleryForm({ initialData, onSubmit }: GalleryFormProps) {
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Update slug cache to include timestamps
  const slugCache = useRef<Map<string, CachedSlug>>(new Map());

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    navigation: {
      category: (initialData?.navigation?.category || "stills") as NavigationCategory,
      primaryCategory: initialData?.navigation?.primaryCategory || "",
      secondaryCategory: initialData?.navigation?.secondaryCategory || "",
    },
    gear: {
      cameras: initialData?.gear?.cameras || [],
      lenses: initialData?.gear?.lenses || [],
      accessories: initialData?.gear?.accessories || [],
    },
  });

  const [manualYearOverride, setManualYearOverride] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Clean up old cache entries
  const cleanupCache = () => {
    const now = Date.now();
    const entries = Array.from(slugCache.current.entries());
    
    // Remove expired entries
    entries.forEach(([slug, data]) => {
      if (now - data.timestamp > CACHE_DURATION) {
        slugCache.current.delete(slug);
      }
    });

    // If still too many entries, remove oldest ones
    if (slugCache.current.size > MAX_CACHE_SIZE) {
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - MAX_CACHE_SIZE);
      entriesToRemove.forEach(([slug]) => slugCache.current.delete(slug));
    }
  };

  const forceRefreshSlugCache = async (slug: string) => {
    setIsCheckingSlug(true);
    slugCache.current.delete(slug);
    await checkSlugAvailability(slug);
    setIsCheckingSlug(false);
  };

  const generateSlug = (title: string): string => {
    const yearToUse = manualYearOverride ? selectedYear : new Date().getFullYear();
    
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${yearToUse}`;
  };

  useEffect(() => {
    // Clean up cache periodically
    const cleanupInterval = setInterval(cleanupCache, CACHE_DURATION);
    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    const updateSlug = async () => {
      if (!formData.title) return;
      
      try {
        setIsCheckingSlug(true);
        const baseSlug = generateSlug(formData.title);
        let finalSlug = baseSlug;
        let counter = 1;
        let isAvailable = await checkSlugAvailability(finalSlug);
        
        while (!isAvailable) {
          finalSlug = `${baseSlug}-${counter}`;
          isAvailable = await checkSlugAvailability(finalSlug);
          counter++;
        }
        
        setFormData(prev => ({ ...prev, slug: finalSlug }));
      } catch (error) {
        setErrors(prev => ({ 
          ...prev, 
          slug: error instanceof Error ? error.message : "Invalid year in slug" 
        }));
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timeoutId = setTimeout(updateSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.title]);

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    // Check cache and verify it hasn't expired
    const cached = slugCache.current.get(slug);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      return cached.isAvailable;
    }
    
    const q = query(
      collection(db, "galleries"),
      where("slug", "==", slug)
    );
    
    const querySnapshot = await getDocs(q);
    const isAvailable = querySnapshot.empty;
    
    // Cache the result with timestamp
    slugCache.current.set(slug, {
      isAvailable,
      timestamp: now
    });
    
    return isAvailable;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!coverImage && !initialData?.photoUrl) {
      newErrors.coverImage = "Cover image is required";
    }

    if (formData.navigation.category === "stills" && !formData.navigation.primaryCategory) {
      newErrors.primaryCategory = "Primary category is required for stills";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

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
      setSubmitError("Failed to create gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const primaryCategoryOptions = {
    stills: ["Landscape", "Urban", "Creative"],
    travel: ["Asia", "Europe", "Americas", "Africa", "Oceania"],
    aerial: ["Drone", "Helicopter"],
  };

  // Fix the category change handler
  const handleCategoryChange = (category: NavigationCategory) => {
    setFormData(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        category,
        primaryCategory: '', // Reset primary category when changing main category
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        {submitError && (
          <div className="animate-slide-down rounded-lg bg-red-50 p-4 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all duration-200 hover:shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                  transition-colors duration-200"
                required
              />
            </div>

            {/* Slug Section with Year Override */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Override Year</label>
                  <button
                    type="button"
                    onClick={() => setManualYearOverride(!manualYearOverride)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      manualYearOverride ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      manualYearOverride ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-grow">
                  <div className="relative rounded-md shadow-sm">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                      /gallery/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      readOnly
                      className="block w-full rounded-md border-gray-300 pl-20 bg-gray-50 sm:text-sm"
                    />
                  </div>
                </div>

                {manualYearOverride && (
                  <div className="w-32">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.navigation.category}
                onChange={(e) => handleCategoryChange(e.target.value as NavigationCategory)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="stills">Stills</option>
                <option value="travel">Travel</option>
                <option value="aerial">Aerial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Category
              </label>
              <select
                value={formData.navigation.primaryCategory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    navigation: {
                      ...prev.navigation,
                      primaryCategory: e.target.value,
                    },
                  }))
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                  ${errors.primaryCategory ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {primaryCategoryOptions[formData.navigation.category as keyof typeof primaryCategoryOptions].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  )
                )}
              </select>
              {errors.primaryCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryCategory}</p>
              )}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Equipment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cameras (comma-separated)
              </label>
              <input
                type="text"
                value={formData.gear.cameras.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gear: {
                      ...prev.gear,
                      cameras: e.target.value.split(",").map((item) => item.trim()),
                    },
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lenses (comma-separated)
              </label>
              <input
                type="text"
                value={formData.gear.lenses.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gear: {
                      ...prev.gear,
                      lenses: e.target.value.split(",").map((item) => item.trim()),
                    },
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Accessories (comma-separated)
              </label>
              <input
                type="text"
                value={formData.gear.accessories.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gear: {
                      ...prev.gear,
                      accessories: e.target.value.split(",").map((item) => item.trim()),
                    },
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {errors.coverImage && (
                <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
              )}
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {loading ? "Creating Gallery..." : "Create Gallery"}
        </button>
      </form>
    </div>
  );
}
