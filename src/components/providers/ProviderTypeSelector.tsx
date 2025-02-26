import { View, Text, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";

interface ProviderTypeSelectorProps {
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
}

export function ProviderTypeSelector({
  selectedProvider,
  onProviderSelect,
}: ProviderTypeSelectorProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-text mb-2">
        Provider Type
      </Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-wrap flex-row gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(PREDEFINED_PROVIDERS).map(([key, provider]) => (
            <TouchableOpacity
              key={key}
              onPress={() => onProviderSelect(provider)}
              className={`p-3 rounded-lg border-2 bg-surface ${
                selectedProvider.endpoint === provider.endpoint
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <View className="flex-row items-center mb-1">
                {provider.logo && (
                  <Image
                    source={{ uri: provider.logo }}
                    className="!w-[24px] !h-[24px] rounded-full mr-2"
                  />
                )}
                <Text className="text-text flex-1">{provider.name}</Text>
              </View>

              <View className="flex-row space-x-2 mt-auto">
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
                    className={provider.capabilities?.[key as keyof Provider['capabilities']] ? "!text-primary" : "!text-secondary opacity-60"}
                  />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 