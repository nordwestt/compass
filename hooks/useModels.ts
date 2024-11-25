import AsyncStorage from '@react-native-async-storage/async-storage';
import { Model, Provider } from '@/types/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { availableProvidersAtom, availableModelsAtom } from '@/hooks/atoms';
import { useEffect, useCallback, useRef, useMemo } from 'react';

export const loadDefaultModel = async (): Promise<Model | null> => {
  try {
    const storedDefault = await AsyncStorage.getItem('defaultModel');
    if (storedDefault) {
      return JSON.parse(storedDefault);
    }
  } catch (error) {
    console.error('Error loading default model:', error);
  }
  return null;
};

export function useModels() {

  const setDefaultModel = async (model: Model) => {
    try {
      if (model) {
        await AsyncStorage.setItem('defaultModel', JSON.stringify(model));
      }
    } catch (error) {
      console.error('Error saving default model:', error);
    }
  };

  const loadDefaultModel = async () => {
    try {
      const storedDefault = await AsyncStorage.getItem('defaultModel');
      if (storedDefault) {
        return storedDefault;
      }
    } catch (error) {
      console.error('Error loading default model:', error);
    }
  };


  return {
    setDefaultModel
  };
} 

let isLoadingModels = false;
export const fetchAvailableModelsV2 = async (
  endpoints: Provider[]
): Promise<Model[]> => {
  isLoadingModels = true;
  try {
    if (!endpoints?.length) {
      return [];
    }
    console.log('fetching models from endpoints', endpoints);

    const models: Model[] = [];

    for (const provider of endpoints) {
      try {
        switch (provider.source) {
          case 'ollama':
            const ollamaResponse = await fetch(`${provider.endpoint}/api/tags`);
            const ollamaData = await ollamaResponse.json();
            models.push(...ollamaData.models.map((model: any) => ({
              id: model.name,
              name: model.name,
              provider: provider
            })));
            break;

          case 'openai':
            const openaiResponse = await fetch('https://api.openai.com/v1/models', {
              headers: {
                'Authorization': `Bearer ${provider.apiKey}`
              }
            });
            const openaiData = await openaiResponse.json();
            models.push(...openaiData.data
              .filter((model: any) => model.id.includes('gpt'))
              .map((model: any) => ({
                id: model.id,
                name: model.id,
                provider: provider
              })));
            break;

          case 'anthropic':
            const anthropicResponse = await fetch('https://api.anthropic.com/v1/models', {
              headers: {
                'x-api-key': provider.apiKey,
                'anthropic-version': '2023-06-01'
              }
            });
            const anthropicData = await anthropicResponse.json();
            models.push(...anthropicData.map((model: any) => ({
              id: model.name,
              name: model.name,
              provider: provider
            })));
            break;
        }
      } catch (error) {
        console.error(`Error fetching models for ${provider.endpoint} (${provider.source}):`, error);
      }
    }

    return models; 
  } catch (error) {
    console.error('Error fetching models:', error);
  } finally {
    isLoadingModels = false;
  }
  return [];
};

export function useModelFetching(endpoints: Provider[]) {
  const [models, setAvailableModels] = useAtom(availableModelsAtom);
  const [providers, setProviders] = useAtom(availableProvidersAtom);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFetchTimeRef = useRef<number>(0);
  const initialFetchDoneRef = useRef(false);
  const FETCH_COOLDOWN = 5000;

  const fetchModels = useCallback(async (isInitialFetch = false) => {
    const now = Date.now();
    if (!isInitialFetch && now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }

    if(endpoints.length === 0) {
      console.log('no endpoints, scanning for ollama instances');
      const ollamaEndpoints = await scanForOllamaInstances();
      
      setProviders(ollamaEndpoints.map((endpoint) => ({
        endpoint,
        name: "Ollama",
        source: 'ollama',
        apiKey: '', // assume no api key
        capabilities: {
          llm: true,
          tts: false,
          stt: false
        }
      } as Provider)));
    }

    if (endpoints.length > 0) {
      lastFetchTimeRef.current = now;
      const newModels = await fetchAvailableModelsV2(endpoints);

      
      if (JSON.stringify(newModels) !== JSON.stringify(models)) {
        setAvailableModels(newModels);
      }
    }
  }, [endpoints, models, setAvailableModels]);

  useEffect(() => {
    if (endpoints.length > 0 && !initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchModels(true);
    }

    const intervalId = setInterval(() => fetchModels(false), 30000);

    return () => {
      clearInterval(intervalId);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchModels, endpoints]);

  return useMemo(() => models, [models]);
}

async function scanForOllamaInstances(): Promise<string[]> {
  const endpoints: string[] = [];
  
  // Common local network patterns
  const networkPatterns = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
  ];

  // Generate IP range for 192.168.1.x
  // for (let i = 1; i <= 254; i++) {
  //   networkPatterns.push(`http://192.168.1.${i}:11434`);
  // }
  networkPatterns.push('http://192.168.1.76:11434');

  // Generate IP range for 192.168.0.x
  // for (let i = 1; i <= 254; i++) {
  //   networkPatterns.push(`http://192.168.0.${i}:11434`);
  // }

  // Test each endpoint with a timeout
  const testEndpoint = async (endpoint: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

      const response = await fetch(`${endpoint}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        endpoints.push(endpoint);
      }
    } catch (error) {
      // Ignore connection errors
      console.log('error', error);
    }
  };

  // Run all tests concurrently with Promise.all
  await Promise.all(networkPatterns.map(testEndpoint));

  console.log('networkPatterns', networkPatterns);
  console.log('endpoints', endpoints);

  // register the endpoints
  
  
  return endpoints;
}