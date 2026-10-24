import { apiClient } from '@/lib/api/axios-client';
import mockTagsData from '@/lib/data/mock-tags.json';

class TagService {
  /**
   * Fetch trending tags list.
   * Prioritizes backend API; automatically falls back to Mock JSON if offline.
   */
  async getTrendingTags(): Promise<string[]> {
    try {
      const res = await apiClient.get('/api/v1/public/tags/trending', { timeout: 2000 });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch {
      // fallback to mock-tags.json
    }

    return mockTagsData as string[];
  }
}

export const tagService = new TagService();
export default tagService;
