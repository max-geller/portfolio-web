import imageCompression from 'browser-image-compression';

interface OptimizationOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

export async function optimizeImage(
  file: File, 
  options: Partial<OptimizationOptions> = {}
): Promise<File> {
  const defaultOptions: OptimizationOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    ...options
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    return file;
  }
}