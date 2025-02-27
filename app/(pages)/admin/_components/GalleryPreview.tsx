import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImageWithMetadata } from '@/app/types/gallery';

interface GalleryPreviewProps {
  images: GalleryImageWithMetadata[];
  isOpen: boolean;
  onClose: () => void;
}

export function GalleryPreview({ images, isOpen, onClose }: GalleryPreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto"
          onClick={onClose}
        >
          <div className="min-h-screen px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {images.map((image, index) => (
                <motion.div
                  key={image.previewUrl}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Metadata Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 transition-all duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                    <div className="text-white space-y-1">
                      {image.metadata?.camera && (
                        <p className="font-medium">
                          {`${image.metadata.camera.make} ${image.metadata.camera.model}`.trim()}
                        </p>
                      )}
                      {image.metadata?.lens && (
                        <p className="text-sm">
                          {`${image.metadata.lens.make} ${image.metadata.lens.model}`.trim()}
                        </p>
                      )}
                      <div className="text-xs space-x-2">
                        {image.metadata?.settings && (
                          <>
                            <span>{image.metadata.settings.shutterSpeed}s</span>
                            <span>f/{image.metadata.settings.aperture}</span>
                            <span>ISO {image.metadata.settings.iso}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}