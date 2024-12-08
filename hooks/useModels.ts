import AsyncStorage from '@react-native-async-storage/async-storage';
import { Model, Provider } from '@/types/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { availableProvidersAtom, availableModelsAtom, logsAtom } from '@/hooks/atoms';
import { useEffect, useCallback, useRef, useMemo } from 'react';
import LogService from '@/utils/LogService';
import axios from 'axios';

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


export function useModelFetching(providers: Provider[]) {
  const [models, setAvailableModels] = useAtom(availableModelsAtom);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFetchTimeRef = useRef<number>(0);
  const initialFetchDoneRef = useRef(false);
  const FETCH_COOLDOWN = 10000;

  const fetchAvailableModelsV2 = async (
    endpoints: Provider[]
  ): Promise<Model[]> => {
    isLoadingModels = true;
    try {
      if (!endpoints?.length) {
        return [];
      }
  
      const models: Model[] = [];
  
      for (const provider of endpoints) {
        try {
          switch (provider.source) {
            case 'ollama':
              const { data: ollamaData } = await axios.get(`${provider.endpoint}/api/tags`, {
                headers: {
                  'Accept': 'application/json',
                }
              });
              
              if (ollamaData && Array.isArray(ollamaData.models)) {
                models.push(...ollamaData.models
                  .filter((model: any) => model && typeof model.name === 'string')
                  .map((model: any) => ({
                    id: model.name,
                    name: model.name,
                    provider: provider
                  })));
              } else {
                LogService.log(
                  `Invalid Ollama response structure: ${JSON.stringify(ollamaData)}`,
                  {component: 'useModelFetching', function: 'fetchAvailableModelsV2'},
                  'error'
                );
              }
              break;
  
            case 'openai':
              const { data: openaiData } = await axios.get('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${provider.apiKey}`
                }
              });
              models.push(...openaiData.data
                .filter((model: any) => model.id.includes('gpt'))
                .map((model: any) => ({
                  id: model.id,
                  name: model.id,
                  provider: provider
                })));
              break;
  
            case 'anthropic':
              const { data: anthropicData } = await axios.get('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': provider.apiKey,
                  'anthropic-version': '2023-06-01'
                }
              });
              models.push(...anthropicData.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: provider
              })));
              break;
          }
        } catch (error: any) {
          
          LogService.log(error, {component: 'useModelFetching', function: 'fetchAvailableModelsV2'}, 'error');
        }
      }
  
      return models; 
    } catch (error: any) {

      LogService.log(error, {component: 'useModelFetching', function: 'fetchAvailableModelsV2'}, 'error');
    } finally {
      isLoadingModels = false;
    }
    return [];
  };

  const fetchModels = useCallback(async (isInitialFetch = false) => {
    const now = Date.now();
    if (!isInitialFetch && now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
      return;
    }

    if(providers.length === 0) {
      return useMemo(()=> models, [models]);
    }

    if (providers.length > 0) {
      lastFetchTimeRef.current = now;
      const newModels = await fetchAvailableModelsV2(providers);

      
      if (JSON.stringify(newModels) !== JSON.stringify(models)) {
        setAvailableModels(newModels);
      }
    }
  }, [providers, models, setAvailableModels]);

  useEffect(() => {
    if (providers.length > 0 && !initialFetchDoneRef.current) {
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
  }, [fetchModels, providers]);

  return useMemo(() => models, [models]);
}

