import { apiClient } from '@/lib/api-client';
import { handleServiceError } from '@/utils/helpers/service-utils';

export interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: string;
  author: string;
  thumbnailUrl: string;
  externalUrl: string;
  spotifyId: string;
  publishedAt: string;
  source?: {
    id: number;
    name: string;
    category: string;
  };
}

export interface PodcastResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    description: string;
    duration: string;
    author: string;
    thumbnailUrl: string;
    externalUrl: string;
    spotifyId: string;
    publishedAt: string;
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

export interface PodcastParams {
  sort?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  populate?: string[] | string;
  filters?: Record<string, any>;
}

export const podcastService = {
  async getPodcasts(params?: PodcastParams): Promise<PodcastResponse> {
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

      const { data } = await apiClient.get<PodcastResponse>(`/api/spotify-podcasts?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Podcasts');
    }
  },

  mapPodcastResponse(response: PodcastResponse): Podcast[] {
    return response.data.map(item => ({
      id: item.id.toString(),
      documentId: item.documentId,
      title: item.title,
      description: item.description,
      duration: item.duration,
      author: item.author,
      thumbnailUrl: item.thumbnailUrl,
      externalUrl: item.externalUrl,
      spotifyId: item.spotifyId,
      publishedAt: item.publishedAt,
    }));
  }
}; 