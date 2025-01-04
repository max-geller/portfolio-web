// Gallery image metadata
export interface ImageMetadata {
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  description?: string;
  caption?: string;
  title?: string;
}

export interface GalleryImage {
  url: string;
  aspectRatio: number;
  displaySize?: "small" | "medium" | "large";
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

interface ExifMetadata {
  camera?: {
    make: string;
    model: string;
  };
  lens?: {
    make: string;
    model: string;
  };
  settings?: {
    focalLength: number;
    aperture: number;
    shutterSpeed: number;
    iso: number;
  };
  dimensions?: {
    width: number;
    height: number;
  };
  datetime?: Date;
  filename: string;
  filesize: number;
  type: string;
}

export interface GalleryImageWithMetadata {
  file?: File;
  previewUrl: string;
  aspectRatio: number;
  metadata?: ExifMetadata;
}

// Gallery metadata
export interface GalleryNavigation {
  category: "travel" | "stills" | "aerial";
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

export type PrimaryCategoryOptions = {
  stills: string[];
  travel: string[];
  aerial: string[];
};

export type PrimaryCategoryMap = {
  stills: ["Landscape", "Portrait", "Street", "Nature", "Architecture"];
  travel: ["Asia", "Europe", "Americas", "Africa", "Oceania"];
  aerial: ["Drone", "Aircraft"];
};

export interface NavigationInfoProps {
  formData: Pick<GalleryDocument, "navigation">;
  setFormData: (data: (prev: GalleryDocument) => GalleryDocument) => void;
  baseInputStyles: string;
}
