import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from '@/src/types/core';
import { toastService } from '@/src/services/toastService';
import LogService from '@/utils/LogService';
import { ChatProviderFactory } from '@/src/services/chat/ChatProviderFactory';
import { getProxyUrl } from '@/src/utils/proxy';

interface EditOllamaProps {
  provider: Provider;
}

interface OllamaModel {
  name: string;
  digest: string;
  size: number;
  modified_at?: string;
}

interface AvailableModel {
  id: string;
}

export function EditOllama({ provider }: EditOllamaProps) {
  const [localModels, setLocalModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPulling, setPulling] = useState<string | null>(null);
  const [customModelId, setCustomModelId] = useState('');

  const recommendedModels: AvailableModel[] = [
    { id: "TheAzazel/l3.2-rogue-creative-instruct-abliterated-7b"},
    { id: "llama3.2:3b" },
    { id: "llama3.2:1b" },
  ];

  const fetchLocalModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(await getProxyUrl(`${provider.endpoint}/api/tags`));
      const data = await response.json();
      if (data && Array.isArray(data.models)) {
        setLocalModels(data.models);
      }
    } catch (error: any) {
      console.log("Error fetching local models", provider.endpoint);
      LogService.log(error, { component: 'EditOllama', function: 'fetchLocalModels' }, 'error');
      toastService.danger({
        title: 'Failed to fetch models',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pullModel = async (modelId: string) => {
    setPulling(modelId);
    try {
      await fetch(await getProxyUrl(`${provider.endpoint}/api/pull`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelId,
          stream: false
        })
      });
      toastService.success({
        title: 'Model is being downloaded',
        description: `${modelId} is being downloaded in the background`
      });

      fetchLocalModels();
    } catch (error: any) {
      LogService.log(error, { component: 'EditOllama', function: 'pullModel' }, 'error');
      toastService.danger({
        title: 'Failed to pull model',
        description: error.message
      });
    } finally {
      setPulling(null);
    }
  };

  const deleteModel = async (modelName: string) => {
    try {
      await fetch(await getProxyUrl(`${provider.endpoint}/api/delete`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName })
      });
      toastService.success({
        title: 'Model deleted',
        description: `${modelName} has been removed`
      });
      fetchLocalModels();
    } catch (error: any) {
      LogService.log(error, { component: 'EditOllama', function: 'deleteModel' }, 'error');
      toastService.danger({
        title: 'Failed to delete model',
        description: error.message
      });
    }
  };

  useEffect(() => {
    fetchLocalModels();
  }, [provider.endpoint]);

  return (
    <View className="flex-1">
      <ScrollView className="p-4">
        <View className="mb-6">
          <Text className="text-xl font-bold text-text mb-2">Local Models</Text>
          {isLoading ? (
            <ActivityIndicator size="large" className="my-4" />
          ) : (
            localModels.map((model) => (
              <View key={model.digest} className="bg-surface p-4 rounded-lg mb-2 border border-border">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-medium text-text">{model.name}</Text>
                    <Text className="text-sm text-secondary">
                      Size: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteModel(model.name)}
                    className="bg-red-500 p-2 rounded-lg"
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-text mb-2">Pull Custom Model</Text>
          <View className="flex-row items-center bg-surface p-4 rounded-lg border border-border">
            <TextInput
              className="flex-1 mr-2 text-text h-full outline-none"
              placeholder="Enter model name (e.g., phi3.5)"
              placeholderTextColor="#666"
              value={customModelId}
              onChangeText={setCustomModelId}
            />
            <TouchableOpacity
              onPress={() => {
                if (customModelId.trim()) {
                  pullModel(customModelId.trim());
                  setCustomModelId('');
                }
              }}
              disabled={isPulling === customModelId || !customModelId.trim()}
              className={`p-2 rounded-lg flex-row items-center ${
                !customModelId.trim() ? 'bg-gray-500' : 'bg-primary'
              }`}
            >
              {isPulling === customModelId ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="download" size={20} color="white" />
                  <Text className="text-white ml-2">Pull</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-xl font-bold text-text mb-2">Recommended Models</Text>
          {recommendedModels.filter((model) => !localModels.some((localModel) => localModel.name === model.id)).map((model) => (
            <View key={model.id} className="bg-surface p-4 rounded-lg mb-2 border border-border">
              <View className="flex-row justify-between items-center">
                <Text className="font-medium text-text flex-1 mr-2" numberOfLines={1} ellipsizeMode="tail">{model.id}</Text>
                <TouchableOpacity
                  onPress={() => pullModel(model.id)}
                  disabled={isPulling === model.id}
                  className="bg-primary p-2 rounded-lg flex-row items-center"
                >
                  {isPulling === model.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="download" size={20} color="white" />
                      <Text className="text-white ml-2">Pull</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
