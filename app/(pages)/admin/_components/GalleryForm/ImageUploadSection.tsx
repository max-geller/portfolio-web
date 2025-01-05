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
import { GalleryImageWithMetadata, ExifMetadata } from '@/app/types/gallery';
import exifr from 'exifr';
import { toast } from 'react-hot-toast';

interface ImageUploadSectionProps {
  galleryImages: GalleryImageWithMetadata[];
  setGalleryImages: (images: GalleryImageWithMetadata[]) => void;
  coverImageId: string | null;
  setCoverImageId: (id: string | null) => void;
}

export const extractEquipmentFromExif = async (file: File) => {
  try {
    const exif = await exifr.parse(file, true);
    if (!exif) return null;

    // Get dimensions from the image file directly
    const img = await createImageBitmap(file);
    const dimensions = {
      width: img.width,
      height: img.height
    };

    return {
      camera: {
        make: exif.Make || '',
        model: exif.Model || '',
      },
      lens: {
        make: exif.LensMake || '',
        model: exif.LensModel || '',
      },
      settings: {
        focalLength: exif.FocalLength,
        aperture: exif.FNumber,
        shutterSpeed: exif.ExposureTime,
        iso: exif.ISO,
      },
      dimensions,
      datetime: exif.DateTimeOriginal,
      filename: file.name,
      filesize: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Error reading EXIF:', error);
    return null;
  }
};

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
      (image) => image.previewUrl === active.id
    );
    setDraggedImage(draggedItem || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = galleryImages.findIndex(
        (image) => image.previewUrl === active.id
      );
      const newIndex = galleryImages.findIndex(
        (image) => image.previewUrl === over.id
      );
      
      setGalleryImages(arrayMove(galleryImages, oldIndex, newIndex));
    }
    
    setDraggedImage(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      try {
        const img = await createImageBitmap(file);
        const aspectRatio = img.width / img.height;
        const exifData = await extractEquipmentFromExif(file);

        const previewUrl = URL.createObjectURL(file);

        const newImage: GalleryImageWithMetadata = {
          file,
          previewUrl,
          aspectRatio,
          metadata: {
            camera: exifData?.camera || {
              make: '',
              model: ''
            },
            lens: exifData?.lens || {
              make: '',
              model: ''
            },
            settings: exifData?.settings || {
              focalLength: 0,
              aperture: 0,
              shutterSpeed: 0,
              iso: 0
            },
            dimensions: exifData?.dimensions || {
              width: img.width,
              height: img.height
            },
            datetime: exifData?.datetime,
            filename: file.name,
            filesize: file.size,
            type: file.type
          }
        };

        setGalleryImages([...galleryImages, newImage]);

        if (!coverImageId) {
          setCoverImageId(previewUrl);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    await handleFileChange({ target: { files } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleMetadataUpdate = (index: number, metadata: ExifMetadata) => {
    const newImages = [...galleryImages];
    if (newImages[index]) {
      const currentMetadata = newImages[index].metadata;
      newImages[index] = {
        ...newImages[index],
        metadata: {
          camera: metadata.camera || { make: '', model: '' },
          lens: metadata.lens || { make: '', model: '' },
          settings: metadata.settings || {
            focalLength: 0,
            aperture: 0,
            shutterSpeed: 0,
            iso: 0
          },
          dimensions: metadata.dimensions || {
            width: 0,
            height: 0
          },
          filename: metadata.filename || currentMetadata?.filename || '',
          filesize: metadata.filesize || currentMetadata?.filesize || 0,
          type: metadata.type || currentMetadata?.type || '',
          datetime: metadata.datetime || currentMetadata?.datetime
        }
      };
    }
    setGalleryImages(newImages);
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
                      handleMetadataUpdate(index, metadata);
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
          onChange={handleFileChange}
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