import { View, Text, TextInput } from 'react-native';
import { ProviderTypeSelector } from './ProviderTypeSelector';
import { LLMProvider } from '@/types/core';

interface ProviderFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  selectedType: LLMProvider['type'];
  setSelectedType: (type: LLMProvider['type']) => void;
  customEndpoint: string;
  setCustomEndpoint: (value: string) => void;
}

export function ProviderFormFields({
  name,
  setName,
  apiKey,
  setApiKey,
  selectedType,
  setSelectedType,
  customEndpoint,
  setCustomEndpoint,
}: ProviderFormFieldsProps) {
  return (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
          placeholder="Enter name"
        />
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
          placeholder="Enter API key"
          secureTextEntry
        />
      </View>

      <ProviderTypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} />

      {selectedType === 'custom' && (
        <View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Endpoint URL
          </Text>
          <TextInput
            value={customEndpoint}
            onChangeText={setCustomEndpoint}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
            placeholder="Enter endpoint URL"
          />
        </View>
      )}
    </View>
  );
} 