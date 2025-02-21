import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Provider } from '@/src/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ScrollView } from 'react-native-gesture-handler';

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
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-text mb-2">Provider Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {Object.entries(PREDEFINED_PROVIDERS).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                setSelectedType(value.source);
                setCustomEndpoint(value.endpoint);
              }}
              className={`mr-2 p-3 rounded-lg flex-row items-center ${
                selectedType === value.source 
                  ? 'bg-primary' 
                  : 'bg-background'
              }`}
            >
              {PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS] && (
                <Image
                  source={PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS]}
                  className="!w-[24px] !h-[24px] rounded-full mr-2"
                />
              )}
              <Text className={selectedType === value.source ? 'text-white' : 'text-text'}>
                {value.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedType === 'custom' && (
        <View>
          <Text className="text-sm font-medium text-text mb-2">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="border border-border rounded-lg p-3 bg-surface text-text"
            placeholder="Enter name"
          />
        </View>
      )}

      <View>
        <Text className="text-sm font-medium text-text mb-2">API Key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          className="border border-border rounded-lg p-3 bg-surface text-text"
          placeholder="Enter API key, if required"
          secureTextEntry
        />
      </View>

      {(selectedType === 'custom' || selectedType === 'ollama') && (
        <View>
          <Text className="text-sm font-medium text-text mb-2">Endpoint URL</Text>
          <TextInput
            value={customEndpoint}
            onChangeText={setCustomEndpoint}
            className="border border-border rounded-lg p-3 bg-surface text-text"
            placeholder="Enter endpoint URL"
          />
        </View>
      )}
    </View>
  );
} 