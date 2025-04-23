import { View, Text, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";
import { useState, useEffect } from "react";
import { useLocalization } from "@/src/hooks/useLocalization";

interface ProviderTypeSelectorProps {
  selectedProvider: Provider;
  onProviderSelect: (provider: Provider) => void;
  initialCapabilityFilter?: keyof Provider['capabilities'] | 'all';
}

type CapabilityFilter = string | keyof Provider['capabilities'];

const CAPABILITY_FILTERS: { key: CapabilityFilter; icon: string }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'llm', icon: 'chatbubble' },
  { key: 'image', icon: 'image' },
  { key: 'tts', icon: 'volume-high' },
  { key: 'stt', icon: 'mic' },
  { key: 'embedding', icon: 'barcode' },
  { key: 'search', icon: 'search' },
];

export function ProviderTypeSelector({
  selectedProvider,
  onProviderSelect,
  initialCapabilityFilter = 'all',
}: ProviderTypeSelectorProps) {
  const { t } = useLocalization();
  const [activeFilter, setActiveFilter] = useState<CapabilityFilter>(initialCapabilityFilter);

  // Set the initial filter when the component mounts
  useEffect(() => {
    if (initialCapabilityFilter) {
      setActiveFilter(initialCapabilityFilter);
    }
  }, [initialCapabilityFilter]);

  const filteredProviders = Object.entries(PREDEFINED_PROVIDERS).filter(([_, provider]) => {
    if (activeFilter === 'all') return true;
    return provider.capabilities?.[activeFilter as keyof Provider['capabilities']];
  });

  return (
    <View>
      <Text className="text-sm font-medium text-text mb-2">
        {t('settings.providers.provider_type')}
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-2">
          {CAPABILITY_FILTERS.map(({ key, icon }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveFilter(key)}
              className={`px-2 py-2 rounded-lg border flex-row items-center min-w-20 h-10 ${
                activeFilter === key
                  ? "bg-primary/10 border-primary"
                  : "border-border"
              }`}
            >
              <Ionicons
                name={icon as any}
                size={16}
                className={activeFilter === key ? "!text-primary" : "!text-secondary"}
              />
              <Text className={`text-sm ml-1 flex-1 ${
                activeFilter === key ? "text-primary" : "text-secondary"
              }`}>
                {t(`settings.providers.capability_filters.${key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-wrap flex-row gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredProviders.map(([key, provider]) => (
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