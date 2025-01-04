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
  dimensions?: {
    width: number;
    height: number;
  };
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
            value={`${image.metadata?.camera?.make || ''} ${image.metadata?.camera?.model || ''}`.trim()}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lens</label>
          <input
            type="text"
            value={`${image.metadata?.lens?.make || ''} ${image.metadata?.lens?.model || ''}`.trim()}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Shutter Speed</label>
          <input
            type="text"
            value={image.metadata?.settings?.shutterSpeed || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Aperture</label>
          <input
            type="text"
            value={image.metadata?.settings?.aperture || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ISO</label>
          <input
            type="text"
            value={image.metadata?.settings?.iso || ''}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}