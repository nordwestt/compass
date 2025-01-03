import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { Provider } from '@/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { ProviderFormFields } from './ProviderFormFields';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ThemeProvider } from '@/components/ThemeProvider';
import { EditOllama } from './EditOllama';


interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
  provider: Provider | null;
}

export function EndpointModal({ visible, onClose, onSave, provider }: EndpointModalProps) {
  const [name, setName] = useState(provider?.name ?? '');
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? '');
  const [selectedType, setSelectedType] = useState<Provider['source']>(provider?.source ?? 'ollama');
  const [customEndpoint, setCustomEndpoint] = useState(provider?.endpoint ?? '');

  useEffect(() => {
    if (provider) {
      setName(provider.name ?? '');
      setApiKey(provider.apiKey ?? '');
      setSelectedType(provider.source);
      setCustomEndpoint(provider.endpoint);
    } else {
      setName('');
      setApiKey('');
      setSelectedType('custom');
      setCustomEndpoint('');
    }
  }, [provider]);

  const handleSave = () => {
    const endpointUrl = customEndpoint;

    const capabilities = PREDEFINED_PROVIDERS[selectedType as keyof typeof PREDEFINED_PROVIDERS].capabilities;

    onSave({
      id: provider?.id ?? '',
      name,
      endpoint: endpointUrl,
      apiKey,
      source: selectedType,
      capabilities
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ThemeProvider>
      <View className="flex-1 justify-end">
        <View className="bg-white dark:bg-gray-900 rounded-t-xl p-6 h-4/5">
          <View className="flex-row items-center mb-6">
            {selectedType !== 'custom' && PROVIDER_LOGOS[selectedType as keyof typeof PROVIDER_LOGOS] && (
              <Image
                source={PROVIDER_LOGOS[selectedType as keyof typeof PROVIDER_LOGOS]}
                className="!w-[48px] !h-[48px] rounded-full mr-3"
              />
            )}
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {provider ? 'Edit API Provider' : 'Add API Provider'}
            </Text>
          </View>

          <ScrollView>
            <ProviderFormFields
              name={name}
              setName={setName}
              apiKey={apiKey}
              setApiKey={setApiKey}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              customEndpoint={customEndpoint}
              setCustomEndpoint={setCustomEndpoint}
            />
            {selectedType === 'ollama' && provider && <EditOllama
              provider={provider!}
            />}
          </ScrollView>

          <View className="flex-row space-x-4 mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 p-4 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <Text className="text-center text-gray-800 dark:text-gray-200">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 p-4 rounded-lg bg-primary"
            >
              <Text className="text-center text-white">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ThemeProvider>
    </Modal>
  );
} 