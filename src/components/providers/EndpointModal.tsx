import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Provider } from '@/types/core';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { ProviderFormFields } from './ProviderFormFields';

interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
  provider: Provider | null;
}

export function EndpointModal({ visible, onClose, onSave, provider }: EndpointModalProps) {
  const [name, setName] = useState(provider?.name ?? '');
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? '');
  const [selectedType, setSelectedType] = useState<Provider['source']>(provider?.source ?? 'custom');
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
    const endpointUrl = selectedType === 'custom' 
      ? customEndpoint 
      : PREDEFINED_PROVIDERS[selectedType].endpoint;

    onSave({
      id: provider?.id ?? '',
      name,
      endpoint: endpointUrl,
      apiKey,
      source: selectedType,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-xl p-6 h-4/5">
          <Text className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            {provider ? 'Edit API Provider' : 'Add API Provider'}
          </Text>

          <ScrollView className="flex-1 mb-6">
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
              className="flex-1 p-4 rounded-lg bg-blue-500"
            >
              <Text className="text-center text-white">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 