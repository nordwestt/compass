import { useAtomValue } from 'jotai';
import { availableProvidersAtom } from '@/hooks/atoms';
import { createSearchService } from '@/src/services/search/searchServiceFactory';
import { SearchResponse } from '@/src/types/search';
import { useState, useCallback } from 'react';

export function useSearch() {
  const providers = useAtomValue(availableProvidersAtom);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string): Promise<SearchResponse | null> => {
    setIsSearching(true);
    setError(null);

    try {
      // Find the first provider with search capability
      const searchProvider = providers.find(p => p.capabilities?.search);
      
      if (!searchProvider) {
        console.error('No search provider configured');
        throw new Error('No search provider configured');
      }

      const searchService = createSearchService(searchProvider);
      
      if (!searchService || !searchService.isConfigured()) {
        console.error('Search service not properly configured');
        throw new Error('Search service not properly configured');
      }

      return await searchService.search(query);
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [providers]);

  return {
    search,
    isSearching,
    error
  };
} 