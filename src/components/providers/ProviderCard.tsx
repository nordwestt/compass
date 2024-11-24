import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LLMProvider } from '@/types/core';

interface ProviderCardProps {
  provider: LLMProvider;
  onEdit: (provider: LLMProvider) => void;
  onDelete: (id: string) => void;
}

export function ProviderCard({ provider, onEdit, onDelete }: ProviderCardProps) {
  return (
    <View key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {provider.type !== 'custom' && (
            <Image
              source={
                provider.type === 'anthropic'
                  ? require('@/assets/images/anthropic-icon.png')
                  : provider.type === 'openai'
                  ? require('@/assets/images/openai-icon.png')
                  : require('@/assets/images/ollama-icon.png')
              }
              className="!w-[64px] !h-[64px] mr-2"
            />
          )}
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {provider.name}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity onPress={() => onEdit(provider)} className="p-2">
            <Ionicons name="pencil" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(provider.id ?? '')} className="p-2">
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 