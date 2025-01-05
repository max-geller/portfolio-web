import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { GalleryImageWithMetadata, ExifMetadata } from '@/app/types/gallery';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from '../GalleryForm/SortableImage';
import { extractEquipmentFromExif } from '../GalleryForm/ImageUploadSection';

interface EditImageSectionProps {
  galleryImages: GalleryImageWithMetadata[];
  setGalleryImages: React.Dispatch<React.SetStateAction<GalleryImageWithMetadata[]>>;
  coverImageId: string;
  setCoverImageId: (id: string) => void;
  setDeletedImages: React.Dispatch<React.SetStateAction<string[]>>;
  gallerySlug: string;
}

export function EditImageSection({
  galleryImages,
  setGalleryImages,
  coverImageId,
  setCoverImageId,
  setDeletedImages,
  gallerySlug
}: EditImageSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [draggedImage, setDraggedImage] = useState<GalleryImageWithMetadata | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = galleryImages.findIndex(
        (image) => image.id === active.id
      );
      const newIndex = galleryImages.findIndex(
        (image) => image.id === over.id
      );
      
      const reorderedImages = arrayMove(galleryImages, oldIndex, newIndex)
        .map((img, index) => ({ ...img, order: index }));
      
      setGalleryImages(reorderedImages);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = await Promise.all(acceptedFiles.map(async file => {
      const reader = new FileReader();
      const exifData = await extractEquipmentFromExif(file);
      
      return new Promise<GalleryImageWithMetadata>((resolve) => {
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const newImage: GalleryImageWithMetadata = {
              id: `temp-${Date.now()}-${file.name}`,
              file,
              url: reader.result as string,
              previewUrl: reader.result as string,
              aspectRatio: img.width / img.height,
              isNew: true,
              order: galleryImages.length,
              metadata: {
                ...exifData,
                filename: file.name,
                filesize: file.size,
                type: file.type,
                dimensions: {
                  width: img.width,
                  height: img.height
                }
              }
            };
            resolve(newImage);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }));

    setGalleryImages(prev => [...prev, ...newImages]);
    if (!coverImageId && newImages.length > 0 && newImages[0].id) {
      setCoverImageId(newImages[0].id);
    }
  }, [coverImageId, setCoverImageId, setGalleryImages, galleryImages.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });

  const handleRemoveImage = (imageId: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    if (coverImageId === imageId) {
      const remainingImages = galleryImages.filter(img => img.id !== imageId);
      setCoverImageId(remainingImages.length > 0 ? remainingImages[0].id : '');
    }
    setDeletedImages(prev => [...prev, imageId]);
  };

  const handleSetCover = (imageId: string) => {
    setCoverImageId(imageId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gallery Images</h2>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}
        `}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag 'n' drop images here, or click to select files
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={galleryImages.map(img => img.id || '')}
          strategy={rectSortingStrategy}
        >
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <SortableImage
                key={image.id}
                image={image}
                index={index}
                isCover={image.id === coverImageId}
                onSetCover={() => setCoverImageId(image.id || '')}
                onDelete={() => handleRemoveImage(image.id || '')}
                viewMode="grid"
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}