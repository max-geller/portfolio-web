import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ListIcon, GridIcon, UploadIcon } from '@/app/_components/icons';
import { GalleryPreview } from '../GalleryPreview';
import { optimizeImage } from '@/app/utils/imageOptimization';
import { SortableImage } from './SortableImage';
import { GalleryImageWithMetadata } from '@/app/types/gallery';

interface ImageUploadSectionProps {
  galleryImages: GalleryImageWithMetadata[];
  setGalleryImages: (images: GalleryImageWithMetadata[]) => void;
  coverImageId: string | null;
  setCoverImageId: (id: string | null) => void;
}

export function ImageUploadSection({
  galleryImages,
  setGalleryImages,
  coverImageId,
  setCoverImageId,
}: ImageUploadSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggedImage, setDraggedImage] = useState<GalleryImageWithMetadata | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = galleryImages.find(
      (image, index) => (image.previewUrl || index.toString()) === active.id
    );
    setDraggedImage(draggedItem || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = galleryImages.findIndex(
        (image, index) => (image.previewUrl || index.toString()) === active.id
      );
      const newIndex = galleryImages.findIndex(
        (image, index) => (image.previewUrl || index.toString()) === over.id
      );
      
      setGalleryImages(arrayMove(galleryImages, oldIndex, newIndex));
    }
    
    setDraggedImage(null);
  };

  const handleImageFiles = async (files: File[]) => {
    const newImages = await Promise.all(
      files.map(async (file) => {
        const optimizedFile = await optimizeImage(file);
        return {
          file: optimizedFile,
          previewUrl: URL.createObjectURL(optimizedFile),
          metadata: {},
        };
      })
    );

    setGalleryImages([...galleryImages, ...newImages]);
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await handleImageFiles(files);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
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
          items={galleryImages.map((image, index) => image.previewUrl || index)}
          strategy={rectSortingStrategy}
        >
          <motion.div
            layout
            className={`
              grid gap-4
              ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <GalleryPreview
            images={galleryImages}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}