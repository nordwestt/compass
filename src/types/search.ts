

export interface SearchResponse {
  results: {url:string, content:string}[];
  totalResults?: number;
  searchTime?: number;
}

export interface SearchProvider {
  id: string;
  name: string;
  source: 'serper' | 'searxng' | 'custom';
  endpoint: string;
  apiKey?: string;
}

export interface SearchService {
  search(query: string): Promise<SearchResponse>;
  isConfigured(): boolean;
} 