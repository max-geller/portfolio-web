// Gallery image metadata
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
  displaySize?: 'small' | 'medium' | 'large';
  gridSpan?: {
    rows: number;
  };
  title?: string;
  caption?: string;
  camera?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
}

export interface GalleryImageWithMetadata extends GalleryImage {
  metadata?: ImageMetadata;
  file?: File;
  previewUrl?: string;
}

// Gallery metadata
export interface GalleryNavigation {
  category: 'travel' | 'stills' | 'aerial';
  primaryCategory?: string;
  secondaryCategory?: string;
  order?: number;
}

export interface GalleryDocument {
  id?: string;
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

export type NavigationCategory = "stills" | "travel" | "aerial";