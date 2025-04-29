import { apiClient } from '@/lib/api-client';
import { handleServiceError } from '@/utils/helpers/service-utils';

export interface QuoteCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Quote {
  id: number;
  documentId: string;
  text: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  categories: QuoteCategory[];
}

export interface QuoteResponse {
  data: Array<{
    id: number;
    documentId: string;
    text: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    categories: QuoteCategory[];
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface QuoteParams {
  sort?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  populate?: string[] | string;
  filters?: Record<string, any>;
}

export const quoteService = {
  async getQuotes(params?: QuoteParams): Promise<QuoteResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Handle populate parameter
      const defaultPopulate = ['*'];
      const populateParams = params?.populate || defaultPopulate;
      
      if (Array.isArray(populateParams)) {
        populateParams.forEach(item => {
          queryParams.append('populate', item);
        });
      } else {
        queryParams.append('populate', populateParams);
      }
      
      // Handle sorting
      if (params?.sort) {
        queryParams.append('sort', params.sort);
      }

      // Handle filters
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          queryParams.append(`filters[${key}]`, value.toString());
        });
      }

      // Handle pagination
      if (params?.pagination) {
        queryParams.append('pagination[page]', params.pagination.page.toString());
        queryParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
      }

      const { data } = await apiClient.get<QuoteResponse>(`/api/quotes?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Quotes');
    }
  },

  mapQuoteResponse(response: QuoteResponse): Quote[] {
    return response.data.map(item => ({
      id: item.id,
      documentId: item.documentId,
      text: item.text,
      author: item.author,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      categories: item.categories
    }));
  },

  // Helper function to determine quote theme based on categories
  determineQuoteTheme(categories: QuoteCategory[]): 'success' | 'motivation' | 'leadership' | 'growth' | 'wisdom' {
    const categoryMap = new Set(categories.map(cat => cat.slug));
    
    if (categoryMap.has('success') || categoryMap.has('achievement')) {
      return 'success';
    }
    if (categoryMap.has('motivation') || categoryMap.has('inspirational')) {
      return 'motivation';
    }
    if (categoryMap.has('leadership') || categoryMap.has('management')) {
      return 'leadership';
    }
    if (categoryMap.has('growth') || categoryMap.has('personal-development')) {
      return 'growth';
    }
    return 'wisdom'; // default theme
  }
}; 