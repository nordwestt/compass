export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  position: number;
}

export interface SearchResponse {
  results: SearchResult[];
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