import { getDefaultStore } from 'jotai';
import { proxyUrlAtom } from '@/src/hooks/atoms';
import {Platform as PlatformCust} from '@/src/utils/platform';

export async function getProxyUrl(url: string): Promise<string> {
  // Only apply proxy for web or Tauri platforms
  if (!PlatformCust.isWeb) {
    return url;
  }

  const store = getDefaultStore();
  const proxyUrl = await store.get(proxyUrlAtom);
  
  // If no proxy URL is set, return original URL
  if (!proxyUrl || typeof proxyUrl !== 'string' || proxyUrl?.length == 0) {
    return url;
  }

  // Ensure proxy URL ends with slash
  const baseProxyUrl = proxyUrl.endsWith('/') ? proxyUrl : `${proxyUrl}/`;
  
  return `${baseProxyUrl}${url}`;
} 