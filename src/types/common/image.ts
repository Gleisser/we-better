// Base interface for image formats
interface ImageFormats {
  large?: {
    url: string;
    width: number;
    height: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
  };
  small?: {
    url: string;
    width: number;
    height: number;
  };
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
}

// Base interface for timestamps
interface TimeStamps {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Base image interface
interface BaseImage extends TimeStamps {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  url: string;
  alt: string;
  src: string;
}

// Standard image with all formats
export interface Image extends BaseImage {
  img: {
    formats: Required<Pick<ImageFormats, 'large' | 'medium' | 'small'>>;
  };
}

// Image with only thumbnail format
export interface ThumbnailImage extends BaseImage {
  img: {
    formats: Pick<ImageFormats, 'thumbnail'>;
  };
}

// Top level image with all properties
export interface TopLevelImage extends BaseImage {
  formats: ImageFormats;
}