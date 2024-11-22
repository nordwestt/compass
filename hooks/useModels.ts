import { Signal, useSignal } from '@preact/signals-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectedModel } from './useChat';

interface Model {
  id: string;
  name: string;
  provider: string;
}

export function useModels() {
  const availableModels = useSignal<Model[]>([]);
  const selectedModel = useSignal<SelectedModel>({id: '', provider: {type: 'ollama', endpoint: '', apiKey: ''}});
  const isLoadingModels = useSignal(false);

  const setDefaultModel = async () => {
    try {
      if (selectedModel.value) {
        await AsyncStorage.setItem('defaultModel', JSON.stringify(selectedModel.value));
      }
    } catch (error) {
      console.error('Error saving default model:', error);
    }
  };

  const loadDefaultModel = async () => {
    try {
      const storedDefault = await AsyncStorage.getItem('defaultModel');
      if (storedDefault) {
        selectedModel.value = JSON.parse(storedDefault);
      }
    } catch (error) {
      console.error('Error loading default model:', error);
    }
  };

  const fetchAvailableModels = async () => {
    isLoadingModels.value = true;
    try {
      await loadDefaultModel();
      const stored = await AsyncStorage.getItem('apiEndpoints');
      if (!stored) return;
      
      const endpoints = JSON.parse(stored);
      const models: Model[] = [];

      for (const endpoint of endpoints) {
        try {
          switch (endpoint.type) {
            case 'ollama':
              const ollamaResponse = await fetch(`http://localhost:11434/api/tags`);
              const ollamaData = await ollamaResponse.json();
              models.push(...ollamaData.models.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: 'Ollama'
              })));
              break;

            case 'openai':
              const openaiResponse = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${endpoint.apiKey}`
                }
              });
              const openaiData = await openaiResponse.json();
              models.push(...openaiData.data
                .filter((model: any) => model.id.includes('gpt'))
                .map((model: any) => ({
                  id: model.id,
                  name: model.id,
                  provider: 'OpenAI'
                })));
              break;

            case 'anthropic':
              const anthropicResponse = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': endpoint.apiKey,
                  'anthropic-version': '2023-06-01'
                }
              });
              const anthropicData = await anthropicResponse.json();
              models.push(...anthropicData.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: 'Anthropic'
              })));
              break;
          }
        } catch (error) {
          console.error(`Error fetching models for ${endpoint.type}:`, error);
        }
      }

      availableModels.value = models;
      if (models.length > 0 && !selectedModel.value) {
        selectedModel.value = {id: models[0].id, provider: endpoints[0]};
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      isLoadingModels.value = false;
    }
  };

  return {
    availableModels,
    selectedModel,
    isLoadingModels,
    fetchAvailableModels,
    setDefaultModel
  };
} 