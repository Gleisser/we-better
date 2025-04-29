// Pagination interface for API responses
export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// Base metadata interface
export interface Meta {
  pagination?: Pagination;
  [key: string]: unknown;
}

// Generic API response wrapper
export interface APIResponse<T> {
  data: T;
  meta: Meta;
}

// Error response interface
export interface APIError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

// API response with error handling
export type APIResponseWithError<T> = {
  data: T;
  meta: Meta;
  error?: APIError;
} 