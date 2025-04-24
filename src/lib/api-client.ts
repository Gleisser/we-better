import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RateLimiter } from './rate-limiter';
import { ENV_CONFIG } from '@/config/env.config';
import { shouldRetry, getRetryDelay, getErrorMessage } from '@/utils/error-handling';
import { APIError, Meta } from '@/types/common/meta';

// Wrapper to maintain backward compatibility
interface ApiResponse<T> {
  data: T;
  meta?: Meta;
}

class ApiClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: ENV_CONFIG.API.URL,
      headers: {
        Authorization: `Bearer ${ENV_CONFIG.API.TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: ENV_CONFIG.API.TIMEOUT,
      // For public APIs that don't require credentials
      withCredentials: false,
    });

    this.rateLimiter = new RateLimiter({
      maxRequests: ENV_CONFIG.RATE_LIMIT.MAX_REQUESTS,
      timeWindow: ENV_CONFIG.RATE_LIMIT.WINDOW,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      const canMakeRequest = await this.rateLimiter.checkLimit();
      
      if (!canMakeRequest) {
        throw new Error('Rate limit exceeded');
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (originalRequest._retry || !shouldRetry(error)) {
          throw error;
        }

        originalRequest._retry = true;

        const retryDelay = getRetryDelay(error, originalRequest._retryCount || 0);
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        await new Promise(resolve => setTimeout(resolve, retryDelay));

        return this.client(originalRequest);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError: APIError = {
          status: error.response?.status || 0,
          name: error.name,
          message: error.response?.data?.error?.message || getErrorMessage(error),
          details: error.response?.data?.error?.details,
        };
        throw apiError;
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 