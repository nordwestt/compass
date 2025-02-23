import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { Provider } from '@/src/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { ProviderFormFields } from './ProviderFormFields';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { Modal } from '@/src/components/ui/Modal';
import { EditOllama } from './EditOllama';
import { toastService } from '@/src/services/toastService';
interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
  provider: Provider | null;
  editing: boolean;
}

export function EndpointModal({ visible, onClose, onSave, provider, editing }: EndpointModalProps) {
  const [name, setName] = useState(provider?.name ?? '');
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? '');
  const [selectedType, setSelectedType] = useState<Provider['source']>(provider?.source ?? 'ollama');
  const [customEndpoint, setCustomEndpoint] = useState(provider?.endpoint ?? '');

  useEffect(() => {
    if (visible) {
      if (provider) {
        setName(provider.name ?? '');
        setApiKey(provider.apiKey ?? '');
        setSelectedType(provider.source);
        setCustomEndpoint(provider.endpoint);
      } else {
        setName('');
        setApiKey('');
        setSelectedType('ollama');
        setCustomEndpoint(PREDEFINED_PROVIDERS.ollama.endpoint);
      }
    }
  }, [visible, provider]);

  const handleSave = () => {
    const provider = PREDEFINED_PROVIDERS[selectedType as keyof typeof PREDEFINED_PROVIDERS];
    if(provider.keyRequired && !apiKey) {
      toastService.danger({title: 'API Key Required', description: 'Please enter an API key for this provider.'});
      return;
    }
    const capabilities = provider.capabilities;
    onSave({
      id: provider?.id ?? '',
      name: name || provider.name,
      endpoint: customEndpoint,
      apiKey,
      source: selectedType,
      capabilities
    });
  };

  return (
    <Modal isVisible={visible} onClose={onClose} maxHeight="85%">
      
      <ScrollView className="p-6">
        <View className="flex-row items-center mb-6">
          {provider && provider.source !== 'custom' && PROVIDER_LOGOS[provider.source] && (
            <Image
              source={PROVIDER_LOGOS[provider.source]}
              className="!w-[48px] !h-[48px] rounded-full mr-3"
            />
          )}
          <Text className="text-xl font-bold text-text">
            {provider ? 'Edit API Provider' : 'Add API Provider'}
          </Text>
        </View>

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

        {selectedType === 'ollama' && provider && (
          <EditOllama provider={provider} />
        )}

        
      </ScrollView>
      <View className="flex-row space-x-4 mt-6 m-2">
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
    </Modal>
  );
} 