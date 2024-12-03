import { SearchResponse, SearchService } from '@/src/types/search';

export class SearxngSearchService implements SearchService {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async performSearch(query: string, options = {}) {
    const defaultOptions = {
      categoryGeneral: true,
      language: 'auto',
      timeRange: '',
      safeSearch: 0,
      theme: 'simple'
    };
  
    const searchOptions = { ...defaultOptions, ...options };
  
    const params = new URLSearchParams({
      q: query,
      category_general: searchOptions.categoryGeneral ? '1' : '0',
      language: searchOptions.language,
      time_range: searchOptions.timeRange,
      safesearch: searchOptions.safeSearch.toString(),
      theme: searchOptions.theme
    });
  
    try {
      const response = await fetch('https://proxy.cors.sh/'+this.endpoint+'/search', {
        method: 'POST',
        headers: {
          'x-cors-api-key': 'temp_57b2078bb750441fd533a8e9b0a8b768',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return response;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  parseSearchResults(htmlString: string): {url:string, content:string}[] {
    // Create a DOM parser to work with the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Get all article elements
    const articles = doc.getElementsByTagName('article');
    
    return Array.from(articles).map(article => {
      // Get the first URL from the article (first <a> tag with href)
      const firstLink = article.querySelector('a[href]');
      const url = firstLink?.getAttribute('href') || '';
      
      // Get the content from the <p> tag, stripping HTML
      const paragraph = article.querySelector('p.content');
      const content = paragraph ? paragraph.textContent?.trim() || '' : '';
      
      return { url, content };
    });
  }

  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await this.performSearch(query);
      const htmlString = await response.text();
      const results = this.parseSearchResults(htmlString);
      return { results };
    } catch (error) {
      console.error('SearXNG search error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.endpoint);
  }
} 