import React, { useEffect, useMemo, useState } from 'react';
import { renewDreamBoardPreviewUrls } from '../../api/dreamBoardPreviewApi';
import {
  DreamBoardImageLike,
  DreamBoardImageRenderVariant,
  clearDreamBoardImageSourceFailure,
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
  className?: string;
};

const DreamBoardPreviewImage: React.FC<DreamBoardPreviewImageProps> = ({
  image,
  alt,
  variant,
  loading,
  fetchPriority,
  className,
}) => {
  const imageDimensions = useMemo(() => getDreamBoardImageDimensions(image), [image]);
  const [renewedPreviewUrls, setRenewedPreviewUrls] = useState<{
    imagePreviewCardUrl?: string;
    imagePreviewWidgetUrl?: string;
  }>({});
  const effectiveImage = useMemo(
    () => ({ ...image, ...renewedPreviewUrls }),
    [image, renewedPreviewUrls]
  );
  const sourceChain = useMemo(
    () => getDreamBoardImageSourceChain(effectiveImage, variant),
    [effectiveImage, variant]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasAttemptedRenewal, setHasAttemptedRenewal] = useState(false);
  const sourceChainKey = sourceChain.join('|');

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceChainKey]);

  useEffect(() => {
    setRenewedPreviewUrls({});
    setHasAttemptedRenewal(false);

    const hasPrivateStorageRef = Boolean(image.imageStorageBucket && image.imageStoragePath);
    const hasUsablePreview =
      variant === 'card'
        ? Boolean(image.imagePreviewCardUrl || image.imagePreviewWidgetUrl)
        : variant === 'widget'
          ? Boolean(image.imagePreviewWidgetUrl || image.imagePreviewCardUrl)
          : true;

    if (!hasPrivateStorageRef || hasUsablePreview) {
      return;
    }

    const storageBucket = image.imageStorageBucket;
    const storagePath = image.imageStoragePath;
    if (!storageBucket || !storagePath) {
      return;
    }

    let cancelled = false;
    setHasAttemptedRenewal(true);
    void renewDreamBoardPreviewUrls(storageBucket, storagePath)
      .then(previewUrls => {
        if (!cancelled) {
          clearDreamBoardImageSourceFailure(previewUrls.imagePreviewCardUrl);
          clearDreamBoardImageSourceFailure(previewUrls.imagePreviewWidgetUrl);
          setRenewedPreviewUrls(previewUrls);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    image.imagePreviewCardUrl,
    image.imagePreviewWidgetUrl,
    image.imageStorageBucket,
    image.imageStoragePath,
    variant,
  ]);

  const imageSrc = sourceChain[sourceIndex] || sourceChain[sourceChain.length - 1] || '';

  const handleError = (): void => {
    markDreamBoardImageSourceFailed(imageSrc);

    if (
      !hasAttemptedRenewal &&
      image.imageStorageBucket &&
      image.imageStoragePath &&
      !imageSrc.startsWith('data:')
    ) {
      setHasAttemptedRenewal(true);
      void renewDreamBoardPreviewUrls(image.imageStorageBucket, image.imageStoragePath)
        .then(previewUrls => {
          clearDreamBoardImageSourceFailure(previewUrls.imagePreviewCardUrl);
          clearDreamBoardImageSourceFailure(previewUrls.imagePreviewWidgetUrl);
          setRenewedPreviewUrls(previewUrls);
        })
        .catch(() => {
          setSourceIndex(currentIndex =>
            currentIndex < sourceChain.length - 1 ? currentIndex + 1 : currentIndex
          );
        });
      return;
    }

    setSourceIndex(currentIndex =>
      currentIndex < sourceChain.length - 1 ? currentIndex + 1 : currentIndex
    );
  };

  return (
    <img
      src={imageSrc}
      className={className}
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
