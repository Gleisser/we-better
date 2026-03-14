import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { ResponsiveMediaSource } from '@/utils/types/responsiveMedia';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  media: ResponsiveMediaSource;
}

const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(
  ({ media, alt, sizes, width, height, fetchPriority, ...imgProps }, ref) => {
    const fetchPriorityProps = fetchPriority
      ? ({ fetchpriority: fetchPriority } as Record<string, string>)
      : undefined;

    return (
      <img
        ref={ref}
        alt={alt ?? media.alt}
        decoding="async"
        height={height ?? media.height}
        sizes={sizes ?? media.sizes}
        src={media.src}
        srcSet={media.srcSet}
        width={width ?? media.width}
        {...fetchPriorityProps}
        {...imgProps}
      />
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';

export default ResponsiveImage;
