import { Provider } from '@/src/types/core';
import { SearchService } from '@/src/types/search';
import { SerperSearchService } from './SerperSearchService';
import { SearxngSearchService } from './SearxngSearchService';

export function createSearchService(provider: Provider): SearchService | null {
  switch (provider.name) {
    case 'Serper':
      return new SerperSearchService(provider.apiKey || '');
    case 'SearXNG':
      return new SearxngSearchService(provider.endpoint);
    default:
      return null;
  }
} 