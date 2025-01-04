import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarIcon, TrashIcon } from '@/app/_components/icons';
import { ImageMetadataForm } from './ImageMetadataForm';
import { GalleryImageWithMetadata, ImageMetadata } from '@/app/types/gallery';

interface SortableImageProps {
  image: GalleryImageWithMetadata;
  index: number;
  viewMode: 'grid' | 'list';
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
  onMetadataUpdate: (metadata: ImageMetadata) => void;
}

export function SortableImage({
  image,
  index,
  viewMode,
  isCover,
  onSetCover,
  onDelete,
  onMetadataUpdate
}: SortableImageProps) {
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
      className={`bg-white rounded-lg shadow-sm ${
        viewMode === 'grid' ? 'p-4' : 'p-6 mb-4'
      } ${isCover ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className={viewMode === 'grid' ? 'space-y-4' : 'flex gap-6'}>
        {/* Image Preview */}
        <div 
          className={`relative cursor-grab active:cursor-grabbing ${
            viewMode === 'grid' ? 'aspect-video w-full' : 'w-48'
          }`}
          {...attributes}
          {...listeners}
        >
          <img
            src={image.previewUrl || image.url}
            alt={image.metadata?.description || `Image ${index + 1}`}
            className="object-cover w-full h-full rounded-lg"
          />
        </div>

        {/* Metadata Form */}
        <div className={viewMode === 'grid' ? 'mt-4' : 'flex-1'}>
          <ImageMetadataForm
            image={image}
            index={index}
            onUpdate={onMetadataUpdate}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onSetCover}
          className={`${
            isCover ? 'text-yellow-500' : 'text-gray-400'
          } hover:text-yellow-500`}
          title={isCover ? 'Cover Image' : 'Set as Cover'}
        >
          <StarIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
          title="Delete Image"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}