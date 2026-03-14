export interface ResponsiveMediaVariant {
  src: string;
  width: number;
  height?: number;
}

export interface ResponsiveVideoSource {
  src: string;
  type: 'video/mp4' | 'video/webm';
}

export interface ResponsiveMediaSource {
  alt: string;
  src: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
  poster?: string;
  video?: ResponsiveVideoSource[];
}
