import { supabase } from '@/core/services/supabaseClient';

export type DreamBoardImageLike = {
  imageUrl?: string;
  imageStorageBucket?: string;
  imageStoragePath?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePlaceholder?: string;
  imagePreviewCardUrl?: string;
  imagePreviewWidgetUrl?: string;
};

export type DreamBoardPreviewVariant = 'card' | 'widget';
export type DreamBoardImageRenderVariant = DreamBoardPreviewVariant | 'placeholder';

export type DreamBoardImageSources = {
  original: string;
  card: string;
  widget: string;
  placeholder: string;
};

const TRANSPARENT_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const FAILED_DREAM_BOARD_IMAGE_SOURCES = new Set<string>();

const DREAM_BOARD_TRANSFORMS: Record<
  DreamBoardPreviewVariant,
  { width: number; height: number; quality: number; resize: 'cover' }
> = {
  card: {
    width: 640,
    height: 854,
    quality: 60,
    resize: 'cover',
  },
  widget: {
    width: 320,
    height: 426,
    quality: 50,
    resize: 'cover',
  },
};

const getTransformedImageUrl = (
  bucket: string,
  path: string,
  variant: DreamBoardPreviewVariant
): string => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: DREAM_BOARD_TRANSFORMS[variant],
  });

  return publicUrl;
};

const getUniqueImageSources = (sources: Array<string | undefined>): string[] =>
  Array.from(
    new Set(
      sources
        .map(source => source?.trim() || '')
        .filter(Boolean)
        .filter(source => !FAILED_DREAM_BOARD_IMAGE_SOURCES.has(source))
    )
  );

export const getDreamBoardImageSources = (image: DreamBoardImageLike): DreamBoardImageSources => {
  const original = image.imageUrl?.trim() || '';
  const previewCard = image.imagePreviewCardUrl?.trim() || '';
  const previewWidget = image.imagePreviewWidgetUrl?.trim() || '';

  if (previewCard || previewWidget) {
    return {
      original,
      card: previewCard || previewWidget || original,
      widget: previewWidget || previewCard || original,
      placeholder: image.imagePlaceholder || TRANSPARENT_PLACEHOLDER,
    };
  }

  if (image.imageStorageBucket && image.imageStoragePath) {
    return {
      original,
      card: getTransformedImageUrl(image.imageStorageBucket, image.imageStoragePath, 'card'),
      widget: getTransformedImageUrl(image.imageStorageBucket, image.imageStoragePath, 'widget'),
      placeholder: image.imagePlaceholder || TRANSPARENT_PLACEHOLDER,
    };
  }

  return {
    original,
    card: original,
    widget: original,
    placeholder: image.imagePlaceholder || TRANSPARENT_PLACEHOLDER,
  };
};

export const getDreamBoardImageSourceChain = (
  image: DreamBoardImageLike,
  variant: DreamBoardImageRenderVariant
): string[] => {
  const sources = getDreamBoardImageSources(image);

  if (variant === 'placeholder') {
    return getUniqueImageSources([sources.placeholder]);
  }

  const preferredSource = variant === 'card' ? sources.card : sources.widget;
  const sourceChain = [preferredSource];

  if (!preferredSource && sources.original) {
    sourceChain.push(sources.original);
  }

  sourceChain.push(sources.placeholder);

  return getUniqueImageSources(sourceChain);
};

export const markDreamBoardImageSourceFailed = (source: string): void => {
  const normalizedSource = source.trim();
  if (
    !normalizedSource ||
    (!normalizedSource.includes('/storage/v1/render/image/') &&
      !normalizedSource.includes('/api/dream-board/previews'))
  ) {
    return;
  }

  FAILED_DREAM_BOARD_IMAGE_SOURCES.add(normalizedSource);
};

export const resetDreamBoardImageSourceFailures = (): void => {
  FAILED_DREAM_BOARD_IMAGE_SOURCES.clear();
};

export const getDreamBoardImageDimensions = (
  image: DreamBoardImageLike
): { width: number; height: number } => ({
  width: image.imageWidth || 3,
  height: image.imageHeight || 4,
});
