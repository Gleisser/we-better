export type AppApiQueryPrimitive = string | number | boolean | null | undefined;
export type AppApiQueryValue = AppApiQueryPrimitive | AppApiQueryPrimitive[];

type CreateAppApiUrlOptions = {
  absoluteBackendOrigin?: string;
  query?: URLSearchParams | Record<string, AppApiQueryValue>;
};

const APP_API_BASE_PATH = '/api';

const normalizeBackendOrigin = (origin: string): string => origin.replace(/\/+$/, '');

const normalizeAppApiPath = (path: string): string => {
  const trimmedPath = path.trim();

  if (!trimmedPath || trimmedPath === '/') {
    return APP_API_BASE_PATH;
  }

  if (trimmedPath.startsWith(APP_API_BASE_PATH)) {
    return trimmedPath;
  }

  return `${APP_API_BASE_PATH}${trimmedPath.startsWith('/') ? '' : '/'}${trimmedPath}`;
};

const appendQueryValue = (
  searchParams: URLSearchParams,
  key: string,
  value: AppApiQueryValue
): void => {
  if (value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(item => {
      if (item !== null) {
        searchParams.append(key, String(item));
      }
    });
    return;
  }

  searchParams.append(key, String(value));
};

const createSearchParams = (
  query?: URLSearchParams | Record<string, AppApiQueryValue>
): URLSearchParams => {
  if (!query) {
    return new URLSearchParams();
  }

  if (query instanceof URLSearchParams) {
    return new URLSearchParams(query);
  }

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    appendQueryValue(searchParams, key, value);
  });
  return searchParams;
};

export const resolveAppApiBaseUrl = (absoluteBackendOrigin?: string): string => {
  if (!absoluteBackendOrigin) {
    return APP_API_BASE_PATH;
  }

  return `${normalizeBackendOrigin(absoluteBackendOrigin)}${APP_API_BASE_PATH}`;
};

export const createAppApiUrl = (path: string, options?: CreateAppApiUrlOptions): string => {
  const pathname = normalizeAppApiPath(path);
  const searchParams = createSearchParams(options?.query);
  const queryString = searchParams.toString();

  if (!options?.absoluteBackendOrigin) {
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  const url = new URL(pathname, `${normalizeBackendOrigin(options.absoluteBackendOrigin)}/`);
  url.search = queryString;
  return url.toString();
};
