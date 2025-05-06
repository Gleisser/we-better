import { apiClient } from '@/core/services/api-client';
import { handleServiceError } from '@/utils/helpers/service-utils';
import { PlatformType } from '@/shared/components/widgets/CourseWidget/config';

export interface CourseCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CoursePrice {
  id: number;
  current: number;
  original: number;
  currency: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  instructor: string;
  platform: PlatformType;
  thumbnail: string;
  url: string;
  rating: number;
  studentsCount: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  language: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  price: CoursePrice;
  categories: CourseCategory[];
}

interface CourseResponse {
  data: Array<{
    id: number;
    title: string;
    description: string;
    instructor: string;
    rating: number;
    studentsCount: number;
    thumbnail: string;
    url: string;
    documentId: string;
    categories: CourseCategory[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    price: CoursePrice;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    language: string;
    platform: PlatformType;
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

export const courseService = {
  async getCourses(params?: {
    sort?: string;
    filters?: Record<string, string | number>;
    pagination?: { page: number; pageSize: number };
  }): Promise<CourseResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('populate', '*');

      if (params?.sort) {
        queryParams.append('sort', params.sort);
      }

      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          queryParams.append(`filters[${key}]`, value.toString());
        });
      }

      if (params?.pagination) {
        queryParams.append('pagination[page]', params.pagination.page.toString());
        queryParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
      }

      const { data } = await apiClient.get<CourseResponse>(`/courses?${queryParams}`);
      return data;
    } catch (error) {
      return handleServiceError(error, 'Courses');
    }
  },
};
