import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RateLimiter } from './rate-limiter';

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
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1337/api',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      },
    });

    this.rateLimiter = new RateLimiter({
      maxRequests: 50,
      timeWindow: 60000,
      retryAfter: 1000
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