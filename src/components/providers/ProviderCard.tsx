import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from '@/src/types/core';
import { PROVIDER_LOGOS } from '@/src/constants/logos';


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
              source={PROVIDER_LOGOS[provider.source]}
              className="mr-2 !h-[48px] !w-[48px]"
            />
          )}
          <Text className="text-lg font-semibold text-text">
            {provider.name || provider.source}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => onEdit(provider)} 
            className="p-2 rounded-lg hover:bg-background"
          >
            <Ionicons name="pencil" size={20} className="!text-secondary" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onDelete(provider.id ?? '')} 
            className="p-2 rounded-lg hover:bg-red-100 hover:dark:bg-red-900"
          >
            <Ionicons name="trash" size={20} className="!text-red-500 dark:!text-red-300" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 