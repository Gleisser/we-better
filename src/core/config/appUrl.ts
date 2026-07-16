const FALLBACK_APP_ORIGIN = 'https://we-better.vercel.app';

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export const APP_ORIGIN = normalizeOrigin(import.meta.env.VITE_APP_URL) ?? FALLBACK_APP_ORIGIN;

export const createAppUrl = (path = '/'): string => new URL(path, `${APP_ORIGIN}/`).toString();

export function applyAppUrlMetadata(): void {
  const canonicalUrl = createAppUrl('/');
  const imageUrl = createAppUrl('/assets/images/og-image.webp');

  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute('href', canonicalUrl);
  document
    .querySelector<HTMLMetaElement>('meta[property="og:url"]')
    ?.setAttribute('content', canonicalUrl);
  document
    .querySelector<HTMLMetaElement>('meta[name="twitter:url"]')
    ?.setAttribute('content', canonicalUrl);
  document
    .querySelector<HTMLMetaElement>('meta[property="og:image"]')
    ?.setAttribute('content', imageUrl);
  document
    .querySelector<HTMLMetaElement>('meta[name="twitter:image"]')
    ?.setAttribute('content', imageUrl);
}
