import { View, Text, TextInput, TouchableOpacity, Image, Switch } from "react-native";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";
import { ScrollView } from "react-native-gesture-handler";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { ProviderTypeSelector } from "./ProviderTypeSelector";
import { useLocalization } from "@/src/hooks/useLocalization";
import { MicrosoftAuthModal } from "./MicrosoftAuthModal";
import { useAtom } from "jotai";
import { polarisAuthTokenAtom, polarisUserAtom } from "@/src/hooks/atoms";
interface ProviderFormFieldsProps {
  formData: Omit<Provider, 'id'>;
  onChange: (updates: Partial<Omit<Provider, 'id'>>) => void;
  onAuthSuccess: (token: string) => void;
  initialCapabilityFilter?: keyof Provider['capabilities'];
}

export function ProviderFormFields({
  formData,
  onChange,
  initialCapabilityFilter,
  onAuthSuccess,
}: ProviderFormFieldsProps) {
  const { t } = useLocalization();
  const [polarisUser, setPolarisUser] = useAtom(polarisUserAtom);
  const [selectedProvider, setSelectedProvider] = useState(() => {
    // Find the matching predefined provider based on endpoint
    return Object.values(PREDEFINED_PROVIDERS).find(
      p => p.endpoint === formData.endpoint
    ) || PREDEFINED_PROVIDERS.ollama;
  });

  const [authSuccess, setAuthSuccess] = useState(false);

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

  const onMicrosoftAuthSuccess = async (apiKey: string) => {
    console.log("Microsoft auth success", apiKey);
    setAuthSuccess(true);
    onChange({
      apiKey: apiKey,
    });

    // call endpoint http:/.../api/auth/profile
    const response = await fetch(`${formData.endpoint}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const data = await response.json() as {
      id: string, 
      email: string,
      firstName: string,
      lastName: string, 
      isAdmin: boolean, 
      avatarUrl: string
    };

    await setPolarisUser(data);

    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAuthSuccess(apiKey);
  };

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
            {t('settings.providers.form.with_provider_you_can', { provider: selectedProvider.name })}
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {selectedProvider.capabilities?.llm && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="chatbubble"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">{t('settings.providers.form.chat_with_ai')}</Text>
              </View>
            )}
            {selectedProvider.capabilities?.tts && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="volume-high"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">{t('settings.providers.form.convert_text_to_speech')}</Text>
              </View>
            )}
            {selectedProvider.capabilities?.stt && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="mic"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">{t('settings.providers.form.convert_speech_to_text')}</Text>
              </View>
            )}
            {selectedProvider.capabilities?.image && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="image"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">{t('settings.providers.form.generate_images')}</Text>
              </View>
            )}
            {selectedProvider.capabilities?.search && (
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="search"
                  size={16}
                  className="!text-secondary mr-2"
                />
                <Text className="text-secondary flex-1">{t('settings.providers.form.search_web')}</Text>
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
                  {t('settings.providers.form.embed_text')}
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
              {t('settings.providers.form.sign_up_for_api_key', { provider: selectedProvider.name })}
            </Text>
          </TouchableOpacity>
        )}
        
        
        {!authSuccess && (<View className="flex-col p-2 bg-surface rounded-lg">
          
          <Text className="text-sm font-bold text-text mb-2">
            Authorization
          </Text>
          <View className="flex-row gap-2 p-2 bg-surface rounded-lg">
          {selectedProvider.name?.toLowerCase().includes('polaris') && (<View className="flex-row w-1/2"><View className="flex-col flex-1">
            <Text className="text-sm font-medium text-text mb-2">Login with Microsoft</Text>
            <MicrosoftAuthModal
              visible={true}
              onClose={() => {}}
              onSuccess={onMicrosoftAuthSuccess}
              initialEndpoint={formData.endpoint}
            />
          </View>
          <Text className="text-lg font-medium text-text mt-8 mx-4">or</Text>
          </View>)}
          <View className="flex-col flex-1">
            <Text className="text-sm font-medium text-text mb-2">{t('settings.providers.form.api_key')}</Text>
            <TextInput
              value={formData.apiKey}
              onChangeText={(value) => onChange({ apiKey: value })}
              className="border border-border flex-1 h-[40px] py-2 rounded-lg px-4 bg-surface text-text"
              placeholder={selectedProvider.keyRequired 
                ? t('settings.providers.form.enter_api_key') 
                : t('settings.providers.form.enter_api_key_if_required')}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
              secureTextEntry
            />
          </View>
          </View>
        </View>)}
      </View>

      {(isCustom || selectedProvider.name?.toLowerCase().includes('ollama')) && (
        <View>
          <Text className="text-sm font-medium text-text mb-2">
            {t('settings.providers.form.endpoint_url')}
          </Text>
          <TextInput
            value={formData.endpoint}
            onChangeText={(value) => onChange({ endpoint: value })}
            className="border border-border rounded-lg p-3 bg-surface text-text"
            placeholder={t('settings.providers.form.enter_endpoint_url')}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}
    </View>
  );
}
