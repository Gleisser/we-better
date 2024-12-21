import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RateLimiter } from './rate-limiter';
import { ENV_CONFIG } from '@/config/env.config';

// Strapi's response structure
interface StrapiResponse<T> {
  data: T;
}

// Wrapper to maintain backward compatibility
interface ApiResponse<T> {
  data: StrapiResponse<T>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

class ApiClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: ENV_CONFIG.API.URL,
      headers: {
        Authorization: `Bearer ${ENV_CONFIG.API.TOKEN}`,
      },
      timeout: ENV_CONFIG.API.TIMEOUT,
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
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<StrapiResponse<T>>(url, config);
    // Wrap the response to maintain backward compatibility
    return {
      data: response.data,
    };
  }
}

export const apiClient = new ApiClient(); 