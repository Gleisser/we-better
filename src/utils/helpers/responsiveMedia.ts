import { resolveContentImageUrl } from './resolveContentImageUrl';
import type { ResponsiveMediaSource, ResponsiveMediaVariant } from '@/utils/types/responsiveMedia';

type NullableRecord = Record<string, unknown> | null | undefined;

interface BaseMediaValues {
  alt: string;
  height?: number;
  src?: string;
  width?: number;
}

interface CreateLocalResponsiveMediaOptions {
  alt: string;
  sizes: string;
  src: string;
  width?: number;
  height?: number;
  poster?: string;
  variants?: ResponsiveMediaVariant[];
  video?: ResponsiveMediaSource['video'];
}

type FormatKey = 'thumbnail' | 'small' | 'medium' | 'large';

const FORMAT_ORDER: FormatKey[] = ['thumbnail', 'small', 'medium', 'large'];

const asObject = (value: unknown): NullableRecord =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;

const getNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const toResolvedVariant = (value: NullableRecord): ResponsiveMediaVariant | null => {
  if (!value) {
    return null;
  }

  const src = resolveContentImageUrl(getString(value.url));
  const width = getNumber(value.width);

  if (!src || !width) {
    return null;
  }

  return {
    src,
    width,
    height: getNumber(value.height),
  };
};

const getFormats = (input: NullableRecord): Partial<Record<FormatKey, ResponsiveMediaVariant>> => {
  const directFormats = asObject(input?.formats);
  const nestedFormats = asObject(asObject(input?.img)?.formats);
  const formats = directFormats ?? nestedFormats;

  if (!formats) {
    return {};
  }

  return FORMAT_ORDER.reduce<Partial<Record<FormatKey, ResponsiveMediaVariant>>>((acc, key) => {
    const variant = toResolvedVariant(asObject(formats[key]));

    if (variant) {
      acc[key] = variant;
    }

    return acc;
  }, {});
};

const getBaseMediaValues = (input: NullableRecord): BaseMediaValues => {
  const nestedImage = asObject(input?.img);
  const source = nestedImage ?? input;
  const resolvedSrc = resolveContentImageUrl(
    getString(input?.src) ?? getString(input?.url) ?? getString(source?.url)
  );

  return {
    src: resolvedSrc,
    alt: getString(input?.alt) ?? getString(input?.alternativeText) ?? '',
    width: getNumber(source?.width) ?? getNumber(input?.width),
    height: getNumber(source?.height) ?? getNumber(input?.height),
  };
};

export const createLocalResponsiveMedia = ({
  alt,
  sizes,
  src,
  width,
  height,
  poster,
  variants = [],
  video,
}: CreateLocalResponsiveMediaOptions): ResponsiveMediaSource => {
  const resolvedSrc = resolveContentImageUrl(src) ?? src;
  const resolvedPoster = resolveContentImageUrl(poster ?? src) ?? resolvedSrc;
  const srcSet = variants
    .map(variant => {
      const resolvedVariantSrc = resolveContentImageUrl(variant.src) ?? variant.src;
      return `${resolvedVariantSrc} ${variant.width}w`;
    })
    .join(', ');

  return {
    alt,
    src: resolvedSrc,
    width,
    height,
    sizes,
    srcSet: srcSet || undefined,
    poster: resolvedPoster,
    video,
  };
};

export const createResponsiveMediaFromImage = (
  image: unknown,
  options: {
    alt?: string;
    sizes?: string;
  } = {}
): ResponsiveMediaSource | null => {
  const input = asObject(image);

  if (!input) {
    return null;
  }

  const { src, alt, width, height } = getBaseMediaValues(input);

  if (!src) {
    return null;
  }

  const formatVariants = Object.values(getFormats(input)).sort(
    (left, right) => left.width - right.width
  );
  const srcSet = formatVariants.map(variant => `${variant.src} ${variant.width}w`).join(', ');

  return {
    alt: options.alt ?? alt,
    src,
    width,
    height,
    sizes: options.sizes,
    srcSet: srcSet || undefined,
    poster: src,
  };
};
