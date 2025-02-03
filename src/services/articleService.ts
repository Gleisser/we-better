import { apiClient } from '@/lib/api-client';
import { handleServiceError } from '@/utils/service-utils';

export interface Article {
  id: number;
  title: string;
  content: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  readTime: number;
  url: string;
  thumbnail: string;    
  category?: {
      id: number;
      slug: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
        documentId: string;
    };
    tags?: [
      {
        id: number;
        documentId: string;
        slug: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
      }
    ]
    
  };


export interface ArticleResponse {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface ArticleFilters {
  title?: {
    $contains?: string;
  };
  description?: {
    $contains?: string;
  };
  category?: {
    $eq?: string;
  };
}

interface ArticleParams {
  sort?: string;
  pagination?: { 
    page: number; 
    pageSize: number; 
  };
  filters?: ArticleFilters;
}

export const articleService = {
  async getArticles(params?: ArticleParams): Promise<ArticleResponse> {
    try {
      const populateQuery = 'populate=category&&populate=tags';
      const queryParams = new URLSearchParams(populateQuery);
      
      // if (params?.sort) {
      //   queryParams.append('sort', params.sort);
      // }
      
      if (params?.filters) {
        queryParams.append('filters', JSON.stringify(params.filters));
      }
      
      if (params?.pagination) {
        queryParams.append('pagination', JSON.stringify(params.pagination));
      }

      const { data } = await apiClient.get<ArticleResponse>(`/api/articles?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Articles');
    }
  },

  async getArticle(id: string): Promise<{ data: Article }> {
    try {
      const { data } = await apiClient.get<{ data: Article }>(`/articles/${id}?populate=*`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Article');
    }
  },
}; 