import AsyncStorage from '@react-native-async-storage/async-storage';
import { Model, LLMProvider } from '@/types/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { availableEndpointsAtom, availableModelsAtom } from '@/hooks/atoms';
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

  const fetchAvailableModels = async (): Promise<Model[]> => {
    isLoadingModels = true;
    try {
      const [endpoints, setEndpoints] = useAtom(availableEndpointsAtom);
      const setAvailableModels = useSetAtom(availableModelsAtom);

      const models: Model[] = [];

      for (const provider of endpoints) {
        try {
          switch (provider.type) {
            case 'ollama':
              const ollamaResponse = await fetch(`http://localhost:11434/api/tags`);
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
          console.error(`Error fetching models for ${provider.type}:`, error);
        }
      }

      setAvailableModels(models);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      isLoadingModels = false;
    }
    return [];
  };

  return {
    fetchAvailableModels,
    setDefaultModel
  };
} 

let isLoadingModels = false;
export const fetchAvailableModelsV2 = async (
  endpoints: LLMProvider[],
  setAvailableModels: (models: Model[]) => void
): Promise<Model[]> => {
  isLoadingModels = true;
  try {
    if (!endpoints) {
      setAvailableModels([]);
      return [];
    }

    const models: Model[] = [];

    for (const provider of endpoints) {
      try {
        switch (provider.type) {
          case 'ollama':
            const ollamaResponse = await fetch(`http://localhost:11434/api/tags`);
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
        console.error(`Error fetching models for ${provider.type}:`, error);
      }
    }

    setAvailableModels(models);
  } catch (error) {
    console.error('Error fetching models:', error);
  } finally {
    isLoadingModels = false;
  }
  return [];
};