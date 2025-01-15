import { useAtom, useAtomValue } from 'jotai';
import { availableProvidersAtom, availableVoicesAtom } from '@/hooks/atoms';
import { useEffect, useCallback, useRef, useMemo } from 'react';
import { Provider, Voice } from '@/src/types/core';
import { ttsService } from '@/src/services/ttsService';

export const fetchAvailableVoices = async (
  providers: Provider[]
): Promise<Voice[]> => {
  try {
    if (!providers?.length) {
      return [];
    }

    const voices: Voice[] = [];

    for (const provider of providers) {
      try {
        switch (provider.source) {
          case 'elevenlabs':
            const elevenLabsVoices = await ttsService.getVoiceList();
            voices.push(...elevenLabsVoices.map(voice => ({
              ...voice,
              provider
            })));
            break;

          // Add other TTS providers here as needed
          case 'openai':
            // OpenAI TTS voices when implemented
            break;
        }
      } catch (error) {
        console.error(`Error fetching voices for ${provider.source}:`, error);
      }
    }

    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
};

export function useVoices() {
  const [voices, setAvailableVoices] = useAtom(availableVoicesAtom);
  const providers = useAtomValue(availableProvidersAtom);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFetchTimeRef = useRef<number>(0);
  const initialFetchDoneRef = useRef(false);
  const FETCH_COOLDOWN = 1000;

  const fetchVoices = useCallback(async (isInitialFetch = false) => {
    const now = Date.now();
    if (!isInitialFetch && now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }

    // Only fetch from providers that support TTS
    const ttsProviders = providers.filter(p => p.capabilities?.tts || p.source === 'elevenlabs');
    
    if (ttsProviders.length === 0) {
      return;
    }

    lastFetchTimeRef.current = now;
    const newVoices = await fetchAvailableVoices(ttsProviders);

    if (JSON.stringify(newVoices) !== JSON.stringify(voices)) {
      setAvailableVoices(newVoices);
    }
  }, [providers, voices, setAvailableVoices]);

  useEffect(() => {
    if (providers.length > 0 && !initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchVoices(true);
    }

    const intervalId = setInterval(() => fetchVoices(false), 30000);

    return () => {
      clearInterval(intervalId);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchVoices, providers]);

  return useMemo(() => voices, [voices]);
} 