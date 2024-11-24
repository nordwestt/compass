import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { Provider } from '@/types/core';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PROVIDER_LOGOS } from '@/src/constants/logos';


interface ProviderTypeSelectorProps {
  className?: string;
  selectedType: Provider['source'];
    onTypeSelect: (type: Provider['source']) => void;
}

export function ProviderTypeSelector({ className, selectedType, onTypeSelect }: ProviderTypeSelectorProps) {
  return (
    <View className={className}>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Type
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {Object.entries(PREDEFINED_PROVIDERS).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => onTypeSelect(value.source)}
            className={`p-3 rounded-lg flex-row items-center ${
              selectedType === value.source 
                ? 'bg-blue-500' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS] && (
              <Image
                source={PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS]}
                className="!w-[48px] !h-[48px] rounded-full mr-2"
              />
            )}
            <Text 
              className={`${
                selectedType === value.source 
                  ? 'text-white' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {value.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => onTypeSelect('custom')}
          className={`p-3 rounded-lg flex-row items-center ${
            selectedType === 'custom' 
              ? 'bg-blue-500' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Ionicons 
            name="code" 
            size={24} 
            className="mr-2"
            color={selectedType === 'custom' ? 'white' : '#4B5563'} 
          />
          <Text 
            className={`${
              selectedType === 'custom' 
                ? 'text-white' 
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 