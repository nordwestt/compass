import { View, Text, TextInput } from 'react-native';
import { ProviderTypeSelector } from './ProviderTypeSelector';
import { Provider } from '@/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';

interface ProviderFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  selectedType: Provider['source'];
  setSelectedType: (type: Provider['source']) => void;
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
    <View className="m-4">
      <ProviderTypeSelector className="mb-4" selectedType={selectedType} onTypeSelect={(type) => {
        setSelectedType(type);
        setCustomEndpoint(PREDEFINED_PROVIDERS[type as keyof typeof PREDEFINED_PROVIDERS].endpoint);
        }} />

      {selectedType == 'custom' && <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-2">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="border border-border rounded-lg p-3 bg-white"
          placeholder="Enter name"
        />
      </View>}

      <View className="mb-4">
        <Text className="text-sm font-medium text-text mb-2">API Key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          className="border border-border rounded-lg p-3 bg-white"
          placeholder="Enter API key, if required"
          secureTextEntry
        />
      </View>

      {(selectedType === 'custom' || selectedType === 'ollama') && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-text mb-2">
            Endpoint URL
          </Text>
          <TextInput
            value={customEndpoint}
            onChangeText={setCustomEndpoint}
            className="border border-border rounded-lg p-3 bg-white"
            placeholder="Enter endpoint URL"
          />
        </View>
      )}
    </View>
  );
} 