import { View, Text, TextInput, TouchableOpacity, Image, Switch } from "react-native";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";
import { ScrollView } from "react-native-gesture-handler";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { ProviderTypeSelector } from "./ProviderTypeSelector";

interface ProviderFormFieldsProps {
  formData: Omit<Provider, 'id'>;
  onChange: (updates: Partial<Omit<Provider, 'id'>>) => void;
  initialCapabilityFilter?: keyof Provider['capabilities'];
}

export function ProviderFormFields({
  formData,
  onChange,
  initialCapabilityFilter,
}: ProviderFormFieldsProps) {
  const [selectedProvider, setSelectedProvider] = useState(() => {
    // Find the matching predefined provider based on endpoint
    return Object.values(PREDEFINED_PROVIDERS).find(
      p => p.endpoint === formData.endpoint
    ) || PREDEFINED_PROVIDERS.ollama;
  });

  // Update selected provider when formData changes
  useEffect(() => {
    const matchingProvider = Object.values(PREDEFINED_PROVIDERS).find(
      p => p.endpoint === formData.endpoint
    );
    if (matchingProvider) {
      setSelectedProvider(matchingProvider);
    }
  }, [formData.endpoint]);

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    console.log("provider", provider);
    onChange({
      name: provider.name,
      endpoint: provider.endpoint,
      capabilities: provider.capabilities,
      logo: provider.logo,
      keyRequired: provider.keyRequired,
      signupUrl: provider.signupUrl,
    });
  };

  const isCustom = !Object.values(PREDEFINED_PROVIDERS).some(
    p => p.endpoint === formData.endpoint
  );

  return (
    <View className="space-y-4">
      {!formData.apiKey?.length && (
        <ProviderTypeSelector
          selectedProvider={selectedProvider}
          onProviderSelect={handleProviderSelect}
          initialCapabilityFilter={initialCapabilityFilter}
        />
      )}

      <View>
        <View>
          <Text className="text-sm font-medium text-text mb-2">
            With {selectedProvider.name}, you can:
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {selectedProvider.capabilities?.llm && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="chatbubble"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">Chat with AI models</Text>
              </View>
            )}
            {selectedProvider.capabilities?.tts && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="volume-high"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">Convert text to speech</Text>
              </View>
            )}
            {selectedProvider.capabilities?.stt && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="mic"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">Convert speech to text</Text>
              </View>
            )}
            {selectedProvider.capabilities?.image && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="image"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">Generate images</Text>
              </View>
            )}
            {selectedProvider.capabilities?.search && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="search"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">Search the web</Text>
              </View>
            )}
            {selectedProvider.capabilities?.embedding && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="barcode"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">
                  Embed text (required for web search)
                </Text>
              </View>
            )}
          </View>
        </View>

        {selectedProvider.signupUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(selectedProvider.signupUrl!)}
            className="mb-2"
          >
            <Text className="text-primary underline">
              Click here to sign up for an {selectedProvider.name} API key
            </Text>
          </TouchableOpacity>
        )}
        <Text className="text-sm font-medium text-text mb-2">API Key</Text>
        <TextInput
          value={formData.apiKey}
          onChangeText={(value) => onChange({ apiKey: value })}
          className="border border-border flex-1 h-[40px] py-2 rounded-lg px-4 bg-surface text-text"
          placeholder={`Enter API key${selectedProvider.keyRequired ? "" : ", if required"}`}
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
          secureTextEntry
        />
      </View>

      {(isCustom || selectedProvider.name?.toLowerCase().includes('ollama')) && (
        <View>
          <Text className="text-sm font-medium text-text mb-2">
            Endpoint URL
          </Text>
          <TextInput
            value={formData.endpoint}
            onChangeText={(value) => onChange({ endpoint: value })}
            className="border border-border rounded-lg p-3 bg-surface text-text"
            placeholder="Enter endpoint URL"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}
    </View>
  );
}
