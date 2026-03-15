export function buildPublicContentPath(path: string, populateQuery?: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!populateQuery) {
    return `/content${normalizedPath}`;
  }

  return `/content${normalizedPath}?${populateQuery}`;
}
