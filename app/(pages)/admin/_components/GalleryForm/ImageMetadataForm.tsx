import { motion } from 'framer-motion';
import { GalleryImage } from '@/app/types/gallery';

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

interface ImageMetadataFormProps {
  image: GalleryImageWithMetadata;
  index: number;
  onUpdate: (metadata: ImageMetadata) => void;
}

export function ImageMetadataForm({ image, index, onUpdate }: ImageMetadataFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Camera</label>
          <input
            type="text"
            value={image.metadata?.camera || ''}
            onChange={(e) => onUpdate({ ...image.metadata, camera: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lens</label>
          <input
            type="text"
            value={image.metadata?.lens || ''}
            onChange={(e) => onUpdate({ ...image.metadata, lens: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Shutter Speed</label>
          <input
            type="text"
            value={image.metadata?.shutterSpeed || ''}
            onChange={(e) => onUpdate({ ...image.metadata, shutterSpeed: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Aperture</label>
          <input
            type="text"
            value={image.metadata?.aperture || ''}
            onChange={(e) => onUpdate({ ...image.metadata, aperture: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ISO</label>
          <input
            type="text"
            value={image.metadata?.iso || ''}
            onChange={(e) => onUpdate({ ...image.metadata, iso: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={image.metadata?.description || ''}
          onChange={(e) => onUpdate({ ...image.metadata, description: e.target.value })}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Width</label>
          <input
            type="text"
            value={image.metadata?.dimensions?.width || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Height</label>
          <input
            type="text"
            value={image.metadata?.dimensions?.height || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}