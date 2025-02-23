import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Provider } from '@/src/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ScrollView } from 'react-native-gesture-handler';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

  const [selectedProvider, setSelectedProvider] = useState<Provider>(PREDEFINED_PROVIDERS[selectedType as keyof typeof PREDEFINED_PROVIDERS]);
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
                setSelectedProvider(value);
              }}
              className={`mr-2 p-3 rounded-lg border-2 bg-surface ${
                selectedType === value.source 
                  ? 'border-primary' 
                  : 'border-border'
              }`}
            >
              <View className="flex-row items-center">
                {PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS] && (
                  <Image
                    source={PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS]}
                    className="!w-[24px] !h-[24px] rounded-full mr-2"
                  />
                )}
                  <Text className={'text-text'}>
                    {value.name}
                  </Text>
              </View>
              
              <View className="flex-row mt-2 space-x-2">
                <Ionicons 
                  name={value.capabilities?.llm ? 'chatbubble' : 'chatbubble-outline'} 
                  size={16} 
                  className={value.capabilities?.llm ? 'text-primary' : 'text-gray-300'}
                />
                <Ionicons 
                  name={value.capabilities?.tts ? 'volume-high' : 'volume-high-outline'} 
                  size={16} 
                  className={value.capabilities?.tts ? 'text-primary' : 'text-gray-300'}
                />
                <Ionicons 
                  name={value.capabilities?.stt ? 'mic' : 'mic-outline'} 
                  size={16} 
                  className={value.capabilities?.stt ? 'text-primary' : 'text-gray-300'}
                />
                <Ionicons 
                  name={value.capabilities?.image ? 'image' : 'image-outline'} 
                  size={16} 
                  className={value.capabilities?.image ? 'text-primary' : 'text-gray-300'}
                />
                <Ionicons 
                  name={value.capabilities?.search ? 'search' : 'search-outline'} 
                  size={16} 
                  className={value.capabilities?.search ? 'text-primary' : 'text-gray-300'}
                />
              </View>
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


      {selectedProvider.signupUrl && (
          <TouchableOpacity 
            onPress={() => Linking.openURL(selectedProvider.signupUrl!)}
            className="mb-2"
          >
            <Text className="text-primary underline">Click here to sign up for an {selectedProvider.name} API key</Text>
          </TouchableOpacity>
        )}
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