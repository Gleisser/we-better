import { API_CONFIG } from '@/core/config/api-config';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export const resolveContentImageUrl = (url?: string | null): string | undefined => {
  if (typeof url !== 'string') {
    return undefined;
  }

  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    return undefined;
  }

  if (
    ABSOLUTE_URL_PATTERN.test(normalizedUrl) ||
    normalizedUrl.startsWith('blob:') ||
    normalizedUrl.startsWith('data:')
  ) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith('/assets/')) {
    return normalizedUrl;
  }

  return new URL(normalizedUrl, API_CONFIG.imageBaseURL).toString();
};

export default resolveContentImageUrl;
