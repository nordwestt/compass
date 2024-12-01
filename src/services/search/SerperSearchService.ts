import { SearchResponse, SearchService } from '@/src/types/search';

export class SerperSearchService implements SearchService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query })
      });

      const data = await response.json();
      
      return {
        results: data.organic.map((result: any, index: number) => ({
          title: result.title,
          snippet: result.snippet,
          url: result.link,
          position: index + 1
        })),
        totalResults: data.searchParameters?.totalResults,
        searchTime: data.searchParameters?.timeElapsed
      };
    } catch (error) {
      console.error('Serper search error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
} 