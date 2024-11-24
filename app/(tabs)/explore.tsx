import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput } from 'react-native';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { availableEndpointsAtom } from '@/hooks/atoms';
import { LLMProvider } from '@/types/core';

const PREDEFINED_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    type: 'anthropic' as const,
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    type: 'openai' as const,
  },
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/api/chat',
    type: 'ollama' as const,
  },
};

export default function ExploreScreen() {
  const [providers, setProviders] = useAtom(availableEndpointsAtom);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);

  const handleSave = async (provider: LLMProvider) => {
    if (editingProvider) {
      const updated = providers.map(e => 
        e.id === editingProvider.id ? provider : e
      );
      setProviders(updated);
    } else {
      setProviders([...providers, { ...provider, id: Date.now().toString() }]);
    }
    setEditingProvider(null);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const updated = providers.filter(e => e.id !== id);
    setProviders(updated);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          API Providers
        </Text>
        
        {providers.map((provider) => (
          <View key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {provider.type !== 'custom' && (
                  <Image
                    source={provider.type === 'anthropic' 
                      ? require('@/assets/images/anthropic-icon.png')
                      : provider.type === 'openai'
                        ? require('@/assets/images/openai-icon.png')
                        : require('@/assets/images/ollama-icon.png')}
                    className="!w-[64px] !h-[64px] mr-2"
                  />
                )}
                <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {provider.name}
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => {
                    setEditingProvider(provider);
                    setShowModal(true);
                  }}
                  className="p-2"
                >
                  <Ionicons name="pencil" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(provider.id ?? '')}
                  className="p-2"
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          setEditingProvider(null);
          setShowModal(true);
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <EndpointModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProvider(null);
        }}
        onSave={handleSave}
        provider={editingProvider}
      />
    </View>
  );
}

interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (provider: LLMProvider) => void;
  provider: LLMProvider | null;
}

function EndpointModal({ visible, onClose, onSave, provider: provider }: EndpointModalProps) {
  const [name, setName] = useState(provider?.name ?? '');
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? '');
  const [selectedType, setSelectedType] = useState<LLMProvider['type']>(provider?.type ?? 'custom');
  const [customEndpoint, setCustomEndpoint] = useState(provider?.endpoint ?? '');

  useEffect(() => {
    if (provider) {
      setName(provider.name ?? '');
      setApiKey(provider.apiKey ?? '');
      setSelectedType(provider.type);
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
      type: selectedType,
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
          <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            {provider ? 'Edit API Provider' : 'Add API Provider'}
          </Text>

          <ScrollView className="flex-1">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
                  placeholder="Enter name"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </Text>
                <TextInput
                  value={apiKey}
                  onChangeText={setApiKey}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
                  placeholder="Enter API key"
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </Text>
                <View className="flex-row space-x-2">
                  {Object.entries(PREDEFINED_PROVIDERS).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setSelectedType(value.type)}
                      className={`p-3 rounded-lg flex-row items-center ${
                        selectedType === value.type 
                          ? 'bg-blue-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Text className={`${
                        selectedType === value.type 
                          ? 'text-white' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {value.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setSelectedType('custom')}
                    className={`p-3 rounded-lg ${
                      selectedType === 'custom' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text className={`${
                      selectedType === 'custom' 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedType === 'custom' && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint URL
                  </Text>
                  <TextInput
                    value={customEndpoint}
                    onChangeText={setCustomEndpoint}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
                    placeholder="Enter endpoint URL"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          <View className="flex-row space-x-3 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 p-3 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <Text className="text-center text-gray-800 dark:text-gray-200">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 p-3 rounded-lg bg-blue-500"
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
