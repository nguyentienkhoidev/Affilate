import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface MediaItem {
  id: string | number;
  name: string;
  objectKey?: string;
  bucket?: string;
  url: string;
  category: 'stores' | 'articles' | 'banners' | 'icons' | string;
  sizeBytes?: number;
  size: string;
  mimeType?: string;
  dimensions: string;
  format: string;
  createdAt: string;
  tags: string[];
}

export interface MediaQueryOptions {
  search?: string;
  category?: string;
  tag?: string;
  format?: string;
  sortBy?: 'newest' | 'oldest' | 'size-desc' | 'name-asc';
  page?: number;
  size?: number;
}

export interface MediaPageResult {
  content: MediaItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

class MediaService {
  private cachedTagCounts: Record<string, number> | null = null;
  private tagCountsPromise: Promise<Record<string, number>> | null = null;

  async getMedia(options: MediaQueryOptions = {}): Promise<MediaPageResult> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.MEDIA, { params: options });
    return res.data?.data;
  }

  async uploadMedia(
    file: File,
    category: string = 'articles',
    tags: string[] = [],
    dimensions?: string
  ): Promise<MediaItem> {
    this.clearTagCountsCache();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (tags && tags.length > 0) {
      tags.forEach((t) => formData.append('tags', t));
    }
    if (dimensions) {
      formData.append('dimensions', dimensions);
    }

    const res = await apiClient.post(API_ENDPOINTS.ADMIN.MEDIA_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  }

  async updateTags(id: string | number, tags: string[]): Promise<MediaItem> {
    this.clearTagCountsCache();
    const res = await apiClient.put(API_ENDPOINTS.ADMIN.MEDIA_TAGS(id), { tags });
    return res.data?.data;
  }

  async deleteMedia(id: string | number): Promise<void> {
    this.clearTagCountsCache();
    await apiClient.delete(API_ENDPOINTS.ADMIN.MEDIA_DETAIL(id));
  }

  async getAllTags(): Promise<string[]> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.MEDIA_ALL_TAGS);
    return res.data?.data || [];
  }

  async getTagCounts(forceRefresh = false): Promise<Record<string, number>> {
    if (!forceRefresh && this.cachedTagCounts) {
      return this.cachedTagCounts;
    }
    if (this.tagCountsPromise) {
      return this.tagCountsPromise;
    }
    this.tagCountsPromise = apiClient
      .get(API_ENDPOINTS.ADMIN.MEDIA_TAG_COUNTS)
      .then((res) => {
        const counts = res.data?.data || {};
        this.cachedTagCounts = counts;
        return counts;
      })
      .catch(() => ({}))
      .finally(() => {
        this.tagCountsPromise = null;
      });
    return this.tagCountsPromise;
  }

  clearTagCountsCache(): void {
    this.cachedTagCounts = null;
  }
}

export const mediaService = new MediaService();

