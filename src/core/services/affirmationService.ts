import { apiClient } from '@/core/services/api-client';
import { handleServiceError } from '@/utils/helpers/service-utils';

export interface AffirmationCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Affirmation {
  id: number;
  documentId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  categories: AffirmationCategory[];
}

export interface AffirmationResponse {
  data: Array<{
    id: number;
    documentId: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    categories: AffirmationCategory[];
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

export interface AffirmationParams {
  sort?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  populate?: string[] | string;
  filters?: Record<string, string | number | boolean>;
}

export const affirmationService = {
  async getAffirmations(params?: AffirmationParams): Promise<AffirmationResponse> {
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

      const { data } = await apiClient.get<AffirmationResponse>(`/api/affirmations?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Affirmations');
    }
  },

  mapAffirmationResponse(response: AffirmationResponse): Affirmation[] {
    return response.data.map(item => ({
      id: item.id,
      documentId: item.documentId,
      text: item.text,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      categories: item.categories,
    }));
  },

  // Helper function to determine affirmation category based on categories
  determineAffirmationType(
    categories: AffirmationCategory[]
  ):
    | 'personal'
    | 'beauty'
    | 'blessing'
    | 'gratitude'
    | 'happiness'
    | 'health'
    | 'love'
    | 'money'
    | 'sleep'
    | 'spiritual' {
    const categoryMap = new Set(categories.map(cat => cat.slug));

    if (categoryMap.has('affirmation-personal')) return 'personal';
    if (categoryMap.has('affirmation-beauty')) return 'beauty';
    if (categoryMap.has('affirmation-blessing')) return 'blessing';
    if (categoryMap.has('affirmation-gratitude')) return 'gratitude';
    if (categoryMap.has('affirmation-happiness')) return 'happiness';
    if (categoryMap.has('affirmation-health')) return 'health';
    if (categoryMap.has('affirmation-love')) return 'love';
    if (categoryMap.has('affirmation-money')) return 'money';
    if (categoryMap.has('affirmation-sleep')) return 'sleep';
    if (categoryMap.has('affirmation-spiritual')) return 'spiritual';

    return 'personal'; // default category
  },

  // Helper function to determine affirmation intensity
  determineIntensity(categories: AffirmationCategory[]): 1 | 2 | 3 {
    const categoryMap = new Set(categories.map(cat => cat.slug));

    if (categoryMap.has('intensity-high')) return 3;
    if (categoryMap.has('intensity-medium')) return 2;
    return 1; // default to gentle intensity
  },

  async getAffirmationsByCategory(
    category: string,
    params?: Omit<AffirmationParams, 'filters'>
  ): Promise<AffirmationResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add category filter
      queryParams.append('filters[categories][slug][$eq]', `affirmation-${category}`);

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

      // Handle pagination
      if (params?.pagination) {
        queryParams.append('pagination[page]', params.pagination.page.toString());
        queryParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
      }

      const { data } = await apiClient.get<AffirmationResponse>(`/api/affirmations?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Affirmations');
    }
  },
};
