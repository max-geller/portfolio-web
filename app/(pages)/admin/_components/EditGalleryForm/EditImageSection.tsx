import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { GalleryImageWithMetadata } from '@/app/types/gallery';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface EditImageSectionProps {
  galleryImages: GalleryImageWithMetadata[];
  setGalleryImages: (images: GalleryImageWithMetadata[]) => void;
  coverImageId: string;
  setCoverImageId: (id: string) => void;
  setDeletedImages: (ids: string[]) => void;
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => {
      return new Promise<GalleryImageWithMetadata>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: `temp-${Date.now()}-${file.name}`,
              file,
              url: reader.result as string,
              aspectRatio: img.width / img.height,
              isNew: true,
              metadata: {
                name: file.name,
                size: file.size,
                type: file.type,
              }
            });
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(processedImages => {
      setGalleryImages(prev => [...prev, ...processedImages]);
      if (!coverImageId && processedImages.length > 0) {
        setCoverImageId(processedImages[0].id);
      }
    });
  }, [coverImageId, setCoverImageId, setGalleryImages]);

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

      {/* Image Grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryImages.map((image) => (
          <div
            key={image.id}
            className={`
              relative group aspect-square overflow-hidden rounded-lg
              ${coverImageId === image.id ? 'ring-2 ring-indigo-500' : ''}
            `}
          >
            <img
              src={image.url}
              alt={image.metadata?.name || 'Gallery image'}
              className="object-cover w-full h-full"
            />
            
            {/* Image Controls Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSetCover(image.id)}
                className={`
                  px-3 py-1 rounded-full text-xs
                  ${coverImageId === image.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 hover:bg-indigo-500 hover:text-white'
                  }
                `}
              >
                {coverImageId === image.id ? 'Cover Image' : 'Set as Cover'}
              </button>
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Upload Progress */}
            {uploadProgress[image.id] !== undefined && uploadProgress[image.id] < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${uploadProgress[image.id]}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}