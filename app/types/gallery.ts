// Gallery image metadata
export interface GalleryImage {
  url: string;
  aspectRatio: number;
  title: string;
  caption?: string;
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  date?: Date;
  isPublished?: boolean;
  displaySize: 'small' | 'medium' | 'large';
  gridSpan?: {
    rows: number;
    cols: number;
  };
}

// Gallery metadata
export interface GalleryNavigation {
  category: 'travel' | 'stills' | 'aerial';
  primaryCategory?: string;
  secondaryCategory?: string;
  order?: number;
}

export interface GalleryDocument {
  id: string;
  slug: string;
  title: string;
  description?: string;
  location?: string;
  photoUrl: string;
  date: Date;
  navigation: GalleryNavigation;
  gear?: {
    cameras?: string[];
    lenses?: string[];
    accessories?: string[];
  };
}