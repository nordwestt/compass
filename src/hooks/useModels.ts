import AsyncStorage from '@react-native-async-storage/async-storage';
import { Model, Provider } from '@/src/types/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { availableProvidersAtom, availableModelsAtom, logsAtom } from '@/src/hooks/atoms';
import { useEffect, useCallback, useRef, useMemo } from 'react';
import LogService from '@/utils/LogService';

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

    const models: Model[] = [];

    for (const provider of endpoints) {
      try {
        switch (provider.source) {
          case 'ollama':
            const ollamaResponse = await fetch(`${provider.endpoint}/api/tags`, {
              headers: {
                'Accept': 'application/json',
              }
            });
            const ollamaData = await ollamaResponse.json();
            
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
            // Anthropic API call commented out, using static data
            const anthropicData: any[] = [{
              model: 'claude-3-5-haiku-20241022',
              name: 'claude-3-5-haiku-20241022'
            },{
              model: 'claude-3-5-sonnet-20241022',
              name: 'claude-3-5-sonnet-20241022'
            },{
              model: 'claude-3-opus-20240229',
              name: 'claude-3-opus-20240229'
            }];
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

