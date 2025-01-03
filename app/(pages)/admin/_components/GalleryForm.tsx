"use client";
import React, { useState, useEffect, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { GalleryDocument, GalleryImage } from "@/app/types/gallery";
import { ImageMetadataForm } from './ImageMetadataForm';

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { EditIcon, TrashIcon, ListIcon, GridIcon, UploadIcon, StarIcon } from '@/app/_components/icons';
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts';
import { GalleryPreview } from './GalleryPreview';
import { optimizeImage } from '@/app/utils/imageOptimization';

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

interface ImageMetadata {
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  description?: string;
}

interface GalleryImageWithMetadata extends GalleryImage {
  metadata?: ImageMetadata;
  file?: File;
  previewUrl?: string;
}

const SortableImage = ({ 
  image, 
  index, 
  viewMode,
  onMetadataUpdate,
  isCover,
  onSetCover,
  onDelete 
}: { 
  image: GalleryImageWithMetadata; 
  index: number;
  viewMode: 'grid' | 'list';
  onMetadataUpdate: (metadata: ImageMetadata) => void;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.previewUrl || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm p-4 space-y-4 ${isCover ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="relative">
        <div 
          className="aspect-video cursor-grab active:cursor-grabbing" 
          {...attributes} 
          {...listeners}
        >
          <img
            src={image.previewUrl}
            alt={image.title}
            className="object-cover w-full h-full rounded-lg"
          />
        </div>
        
        <div className="absolute top-2 right-2 flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 bg-white rounded-full shadow-sm transition-all duration-200 ${
              isCover 
                ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                : 'hover:bg-gray-50 hover:text-indigo-500'
            }`}
            onClick={onSetCover}
            title={isCover ? "Current Cover Image" : "Set as Cover Image"}
          >
            <motion.div
              animate={isCover ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <StarIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.1, color: '#EF4444' }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Image"
          >
            <TrashIcon className="w-4 h-4" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isCover && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 left-2 bg-indigo-500 text-white px-2 py-1 rounded-md text-xs font-medium"
            >
              Cover Image
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ImageMetadataForm 
          image={image} 
          index={index} 
          onUpdate={onMetadataUpdate}
        />
      </div>
    </div>
  );
};

export default function GalleryForm({ initialData, onSubmit }: GalleryFormProps) {
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImageWithMetadata[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [draggedImage, setDraggedImage] = useState<GalleryImageWithMetadata | null>(null);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    if (!formData.slug) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.navigation.primaryCategory) {
      newErrors.primaryCategory = 'Primary category is required';
    }
    if (galleryImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    if (!coverImageId) {
      newErrors.coverImage = 'Please select a cover image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!validateForm()) {
      console.log('Form validation failed', errors);
      return;
    }
    
    setLoading(true);
    setSubmitError(null);

    try {
      console.log('Looking for cover image', { coverImageId, galleryImages });
      const coverImage = galleryImages.find(img => img.previewUrl === coverImageId);
      
      if (!coverImage?.file) {
        console.log('No cover image found');
        setErrors(prev => ({ ...prev, coverImage: 'Cover image is required' }));
        return;
      }

      // Upload cover image
      console.log('Uploading cover image');
      const coverImageRef = ref(storage, `galleries/${formData.slug}/cover`);
      await uploadBytes(coverImageRef, coverImage.file);
      const coverImageUrl = await getDownloadURL(coverImageRef);
      console.log('Cover image uploaded successfully', coverImageUrl);

      // Upload gallery images
      console.log('Starting gallery images upload');
      const uploadedImages = await Promise.all(
        galleryImages.map(async (image, index) => {
          if (!image.file) {
            console.log(`Skipping image ${index} - no file`);
            return null;
          }
          
          console.log(`Uploading image ${index}`);
          const imageRef = ref(storage, `galleries/${formData.slug}/images/${index}`);
          await uploadBytes(imageRef, image.file);
          const imageUrl = await getDownloadURL(imageRef);
          console.log(`Image ${index} uploaded successfully`, imageUrl);
          
          return {
            url: imageUrl,
            metadata: image.metadata || {},
            title: image.title || '',
            isCover: image.previewUrl === coverImageId
          };
        })
      );

      const galleryData = {
        ...formData,
        photoUrl: coverImageUrl,
        images: uploadedImages.filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Saving to Firestore:', galleryData);

      try {
        const docRef = await addDoc(collection(db, 'galleries'), galleryData);
        console.log('Document written with ID:', docRef.id);
        
        // Temporarily comment out onSubmit to prevent navigation
        // if (onSubmit) {
        //   await onSubmit(galleryData);
        // }
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        throw firestoreError;
      }

    } catch (error) {
      console.error('Error creating gallery:', error);
      setSubmitError('Failed to create gallery');
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedImage(galleryImages.find(img => img.previewUrl === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedImage(null);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setGalleryImages((items) => {
        const oldIndex = items.findIndex(item => item.previewUrl === active.id);
        const newIndex = items.findIndex(item => item.previewUrl === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const handleImageFiles = async (files: File[]) => {
    const optimizedFiles = await Promise.all(
      files.map(file => optimizeImage(file))
    );
    
    const newImages = await Promise.all(
      optimizedFiles.map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          previewUrl,
          title: file.name,
          metadata: {},
        } as GalleryImageWithMetadata;
      })
    );
    
    setGalleryImages([...galleryImages, ...newImages]);
  };

  useKeyboardShortcuts({
    onSave: handleSubmit,
    onPreview: () => setPreviewOpen(true),
    onToggleView: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
    onUpload: () => document.getElementById('image-upload')?.click(),
  });

  // Images Section with Drag and Drop
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
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
        <motion.div
          layout
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gallery Images</h2>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-gray-600 hover:text-gray-900"
              >
                {viewMode === 'grid' ? (
                  <ListIcon className="w-5 h-5" />
                ) : (
                  <GridIcon className="w-5 h-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                Preview Gallery
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={galleryImages.map(img => img.previewUrl || '')}
              strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
            >
              <motion.div
                layout
                className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-4'
                  }
                `}
              >
                <AnimatePresence>
                  {galleryImages.map((image, index) => (
                    <motion.div
                      key={image.previewUrl || index}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SortableImage
                        image={image}
                        index={index}
                        viewMode={viewMode}
                        isCover={image.previewUrl === coverImageId}
                        onSetCover={() => setCoverImageId(image.previewUrl || null)}
                        onDelete={() => {
                          const newImages = galleryImages.filter((_, i) => i !== index);
                          setGalleryImages(newImages);
                          if (image.previewUrl === coverImageId) {
                            setCoverImageId(null);
                          }
                        }}
                        onMetadataUpdate={(metadata) => {
                          const newImages = [...galleryImages];
                          newImages[index].metadata = metadata;
                          setGalleryImages(newImages);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </SortableContext>

            <DragOverlay>
              {draggedImage ? (
                <div className="bg-white rounded-lg shadow-lg p-4 opacity-80">
                  <img
                    src={draggedImage.previewUrl}
                    alt={draggedImage.title}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Drop Zone */}
          <motion.div
            layout
            className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageFiles(Array.from(e.target.files || []))}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-gray-600 hover:text-gray-900"
            >
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium">
                Drop images here or click to upload
              </span>
            </label>
          </motion.div>
        </motion.div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewOpen && <GalleryPreview
            images={galleryImages}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
          />}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading || isCheckingSlug}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${loading || isCheckingSlug 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
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
              'Create Gallery'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
