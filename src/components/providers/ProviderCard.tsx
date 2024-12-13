import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from '@/types/core';

interface ProviderCardProps {
  provider: Provider;
  onEdit: (provider: Provider) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ProviderCard({ provider, onEdit, onDelete, className }: ProviderCardProps) {
  return (
    <View key={provider.id} className={`rounded-lg p-4 shadow-sm ${className}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {provider.source !== 'custom' && (
            <Image
              source={
                provider.source === 'anthropic'
                  ? require('@/assets/images/anthropic-icon.png')
                  : provider.source === 'openai'
                  ? require('@/assets/images/openai-icon.png')
                  : require('@/assets/images/ollama-icon.png')
              }
              className="mr-2 !h-[48px] !w-[48px]"
            />
          )}
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {provider.name || provider.source}
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