import { apiClient } from '@/core/services/api-client';
import { handleServiceError } from '@/utils/helpers/service-utils';

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  author: string;
  category: string;
  subCategory?: string;
  rating: number;
  badge?: 'trending' | 'new';
  publishedAt: string;
  tags: string[];
  thumbnail: string;
  source?: {
    id: number;
    name: string;
    channelId: string;
    category: string;
    url: string;
  };
}

export interface VideoResponse {
  data: Array<{
    id: number;
    documentId: string;
    youtubeId: string;
    title: string;
    description: string;
    duration: string;
    views: number;
    author: string;
    category: string;
    subCategory: string;
    rating: number;
    badge: string;
    publishedAt: string;
    tags: string[];
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    source: {
      id: number;
      name: string;
      channelId: string;
      category: string;
      url: string;
      lastFetched: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
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

export interface VideoParams {
  sort?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  populate?: string[] | string;
  filters?: Record<string, string | number>;
}

export const videoService = {
  async getVideos(params?: VideoParams): Promise<VideoResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Handle populate parameter
      const defaultPopulate = ['source'];
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

      const { data } = await apiClient.get<VideoResponse>(`/youtube-videos?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Videos');
    }
  },

  mapVideoResponse(response: VideoResponse): Video[] {
    return response.data.map(item => ({
      id: item.id.toString(),
      documentId: item.documentId,
      youtubeId: item.youtubeId,
      title: item.title,
      description: item.description,
      duration: item.duration,
      views: item.views,
      author: item.author,
      category: item.category,
      subCategory: item.subCategory,
      rating: item.rating,
      badge: item.badge as 'trending' | 'new' | undefined,
      publishedAt: item.publishedAt,
      tags: item.tags,
      thumbnail: item.thumbnail,
    }));
  },
};
