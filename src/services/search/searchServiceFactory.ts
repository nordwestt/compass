import { Provider } from '@/src/types/core';
import { SearchService } from '@/src/types/search';
import { SerperSearchService } from './SerperSearchService';
import { SearxngSearchService } from './SearxngSearchService';

export function createSearchService(provider: Provider): SearchService | null {
  switch (provider.source) {
    case 'serper':
      return new SerperSearchService(provider.apiKey || '');
    case 'searxng':
      return new SearxngSearchService(provider.endpoint);
    default:
      return null;
  }
} 