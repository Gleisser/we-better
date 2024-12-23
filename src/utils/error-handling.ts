import { APIError } from '@/types/common/meta';

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'name' in error &&
    'message' in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function shouldRetry(error: unknown): boolean {
  if (isAPIError(error)) {
    // Retry on network errors or server errors (5xx)
    return error.status >= 500 || error.status === 0;
  }
  return false;
}

export function isNetworkError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.status === 0;
  }
  return error instanceof Error && error.message.toLowerCase().includes('network');
}

export function isRateLimitError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.status === 429;
  }
  return error instanceof Error && error.message === 'Rate limit exceeded';
}

export function getRetryDelay(error: unknown, attemptIndex: number): number {
  if (isRateLimitError(error)) {
    // Exponential backoff for rate limit errors
    return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
  }
  // Linear backoff for other errors
  return Math.min(1000 * (attemptIndex + 1), 5000);
}

export function getErrorCode(error: unknown): string {
  if (isAPIError(error)) {
    return `ERR_${error.status}`;
  }
  return 'ERR_UNKNOWN';
}

export function getDetailedErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    const details = error.details ? `: ${JSON.stringify(error.details)}` : '';
    return `${error.message}${details}`;
  }
  return getErrorMessage(error);
} 