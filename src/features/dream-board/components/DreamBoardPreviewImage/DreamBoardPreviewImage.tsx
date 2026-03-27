import React, { useEffect, useMemo, useState } from 'react';
import {
  DreamBoardImageLike,
  DreamBoardImageRenderVariant,
  getDreamBoardImageDimensions,
  getDreamBoardImageSourceChain,
  markDreamBoardImageSourceFailed,
} from '../../utils/imageVariants';

type DreamBoardPreviewImageProps = {
  image: DreamBoardImageLike;
  alt: string;
  variant: DreamBoardImageRenderVariant;
  loading: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
};

const DreamBoardPreviewImage: React.FC<DreamBoardPreviewImageProps> = ({
  image,
  alt,
  variant,
  loading,
  fetchPriority,
}) => {
  const imageDimensions = useMemo(() => getDreamBoardImageDimensions(image), [image]);
  const sourceChain = useMemo(
    () => getDreamBoardImageSourceChain(image, variant),
    [image, variant]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const sourceChainKey = sourceChain.join('|');

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceChainKey]);

  const imageSrc = sourceChain[sourceIndex] || sourceChain[sourceChain.length - 1] || '';

  const handleError = (): void => {
    markDreamBoardImageSourceFailed(imageSrc);
    setSourceIndex(currentIndex =>
      currentIndex < sourceChain.length - 1 ? currentIndex + 1 : currentIndex
    );
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      width={imageDimensions.width}
      height={imageDimensions.height}
      onError={handleError}
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
    />
  );
};

export default DreamBoardPreviewImage;
