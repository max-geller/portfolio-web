export type NavigationCategory = "stills" | "travel" | "aerial";

export interface ImageMetadata {
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  description?: string;
}

export interface GalleryImage {
  url: string;
  aspectRatio: number;
}

export interface GalleryImageWithMetadata extends GalleryImage {
  metadata?: ImageMetadata;
  file?: File;
  previewUrl?: string;
}

export interface GalleryDocument {
  title: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  isPublished: boolean;
  navigation: {
    category: NavigationCategory;
    primaryCategory: string;
    secondaryCategory: string;
  };
  gear: {
    cameras: string[];
    lenses: string[];
    accessories: string[];
  };
}