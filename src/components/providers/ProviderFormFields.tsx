import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";
import { ScrollView } from "react-native-gesture-handler";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface ProviderFormFieldsProps {
  formData: Omit<Provider, 'id'>;
  onChange: (updates: Partial<Omit<Provider, 'id'>>) => void;
}

export function ProviderFormFields({
  formData,
  onChange,
}: ProviderFormFieldsProps) {
  const [selectedProvider, setSelectedProvider] = useState(() => {
    // Find the matching predefined provider based on endpoint
    return Object.values(PREDEFINED_PROVIDERS).find(
      p => p.endpoint === formData.endpoint
    ) || PREDEFINED_PROVIDERS.ollama;
  });

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    console.log("provider", provider);
    onChange({
      name: provider.name,
      endpoint: provider.endpoint,
      capabilities: provider.capabilities,
      logo: provider.logo,
    });
  };

  const isCustom = !Object.values(PREDEFINED_PROVIDERS).some(
    p => p.endpoint === formData.endpoint
  );

  return (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-text mb-2">
          Provider Type
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row flex-wrap gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Object.entries(PREDEFINED_PROVIDERS).map(([key, provider]) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleProviderSelect(provider)}
                className={`p-3 rounded-lg border-2 bg-surface ${
                  selectedProvider.endpoint === provider.endpoint
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <View className="flex-row items-center">
                  {provider.logo && (
                    <Image
                      source={{ uri: provider.logo }}
                      className="!w-[24px] !h-[24px] rounded-full mr-2"
                    />
                  )}
                  <Text className="text-text">{provider.name}</Text>
                </View>

                <View className="flex-row mt-2 space-x-2">
                  {[
                    { key: 'llm', icon: 'chatbubble' },
                    { key: 'tts', icon: 'volume-high' },
                    { key: 'stt', icon: 'mic' },
                    { key: 'image', icon: 'image' },
                    { key: 'search', icon: 'search' },
                    { key: 'embedding', icon: 'barcode' },
                  ].map(({ key, icon }) => (
                    <Ionicons
                      key={key}
                      name={provider.capabilities?.[key as keyof Provider['capabilities']] ? icon : `${icon}-outline` as any}
                      size={16}
                      className={provider.capabilities?.[key as keyof Provider['capabilities']] ? "text-primary" : "text-gray-300"}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {isCustom && (
        <View>
          <Text className="text-sm font-medium text-text mb-2">Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(value) => onChange({ name: value })}
            className="border border-border rounded-lg p-3 bg-surface text-text"
            placeholder="Enter name"
          />
        </View>
      )}

      <View>
        <View>
          <Text className="text-sm font-medium text-text mb-2">
            You have chosen {selectedProvider.name}. With this provider, you
            will be able to:
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {selectedProvider.capabilities?.llm && (
              <View className="flex-row items-center">
                <Ionicons
                  name="chatbubble"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">Chat with AI models</Text>
              </View>
            )}
            {selectedProvider.capabilities?.tts && (
              <View className="flex-row items-center">
                <Ionicons
                  name="volume-high"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">Convert text to speech</Text>
              </View>
            )}
            {selectedProvider.capabilities?.stt && (
              <View className="flex-row items-center">
                <Ionicons
                  name="mic"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">Convert speech to text</Text>
              </View>
            )}
            {selectedProvider.capabilities?.image && (
              <View className="flex-row items-center">
                <Ionicons
                  name="image"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">Generate images</Text>
              </View>
            )}
            {selectedProvider.capabilities?.search && (
              <View className="flex-row items-center">
                <Ionicons
                  name="search"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">Search the web</Text>
              </View>
            )}
            {selectedProvider.capabilities?.embedding && (
              <View className="flex-row items-center">
                <Ionicons
                  name="barcode"
                  size={16}
                  className="text-secondary mr-2"
                />
                <Text className="text-secondary">
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
          className="border border-border rounded-lg p-3 bg-surface text-text"
          placeholder={`Enter API key${selectedProvider.keyRequired ? "" : ", if required"}`}
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
          />
        </View>
      )}
    </View>
  );
}
