import { ImgHTMLAttributes } from 'react';

export interface FloatingImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}
