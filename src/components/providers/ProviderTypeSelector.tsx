import { View, Text, TouchableOpacity } from 'react-native';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { LLMProvider } from '@/types/core';

interface ProviderTypeSelectorProps {
  selectedType: LLMProvider['type'];
  onTypeSelect: (type: LLMProvider['type']) => void;
}

export function ProviderTypeSelector({ selectedType, onTypeSelect }: ProviderTypeSelectorProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Type
      </Text>
      <View className="flex-row space-x-2">
        {Object.entries(PREDEFINED_PROVIDERS).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => onTypeSelect(value.type)}
            className={`p-3 rounded-lg flex-row items-center ${
              selectedType === value.type 
                ? 'bg-blue-500' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <Text 
              className={`${
                selectedType === value.type 
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
          className={`p-3 rounded-lg ${
            selectedType === 'custom' 
              ? 'bg-blue-500' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
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