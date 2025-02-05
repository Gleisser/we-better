import { apiClient } from '@/lib/api-client';
import { handleServiceError } from '@/utils/service-utils';
import qs from 'qs';

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
    postDate: string;
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
  filters?: any;
  populate?: string[] | string;
}

export const articleService = {
  async getArticles(params?: ArticleParams): Promise<ArticleResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Handle populate parameter
      const defaultPopulate = ['category', 'tags'];
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
      
      // Handle filters in Strapi's format
      if (params?.filters) {
        // Handle $ne operator for id
        if (params.filters.id?.$ne) {
          queryParams.append('filters[id][$ne]', params.filters.id.$ne);
        }

        // Handle $or conditions
        if (params.filters.$or) {
          console.log(params.filters.$or);
          params.filters.$or.forEach((condition: any, index: number) => {
            // Handle category condition
            if (condition.category?.id?.$eq) {
              queryParams.append(
                `filters[$or][${index}][category][id][$eq]`, 
                condition.category.id.$eq.toString()
              );
            }
            
            // Handle tags condition
            if (condition.tags?.id?.$in) {
              condition.tags.id.$in.forEach((tagId: number) => {
                queryParams.append(
                  `filters[$or][${index}][tags][id][$in][]`, 
                  tagId.toString()
                );
              });
            }
          });
        }
      }

      // Handle pagination - ensure we're not adding duplicates
      const existingParams = Array.from(queryParams.entries());
      const hasPaginationParams = existingParams.some(([key]) => key.startsWith('pagination'));

      if (params?.pagination && !hasPaginationParams) {
        queryParams.append('pagination[page]', params.pagination.page.toString());
        queryParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
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