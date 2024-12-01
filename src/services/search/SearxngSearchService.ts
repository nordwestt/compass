import { SearchResponse, SearchService } from '@/src/types/search';

export class SearxngSearchService implements SearchService {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.endpoint}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          format: 'json',
          pageno: 1
        })
      });

      const data = await response.json();
      
      return {
        results: data.results.map((result: any, index: number) => ({
          title: result.title,
          snippet: result.content,
          url: result.url,
          position: index + 1
        })),
        totalResults: data.number_of_results,
        searchTime: data.search_time
      };
    } catch (error) {
      console.error('SearXNG search error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.endpoint);
  }
} 