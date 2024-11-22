import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useSignal } from '@preact/signals-react';
import { APIEndpoint } from '@/hooks/useChat';

const PREDEFINED_ENDPOINTS = {
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
  const endpoints = useSignal<APIEndpoint[]>([]);
  const showModal = useSignal(false);
  const editingEndpoint = useSignal<APIEndpoint | null>(null);

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      const stored = await AsyncStorage.getItem('apiEndpoints');
      if (stored) {
        endpoints.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading endpoints:', error);
    }
  };

  const saveEndpoints = async (newEndpoints: APIEndpoint[]) => {
    try {
      await AsyncStorage.setItem('apiEndpoints', JSON.stringify(newEndpoints));
      endpoints.value = newEndpoints;
    } catch (error) {
      console.error('Error saving endpoints:', error);
    }
  };

  const handleSave = async (endpoint: APIEndpoint) => {
    if (editingEndpoint.value) {
      const updated = endpoints.value.map(e => 
        e.id === editingEndpoint.value?.id ? endpoint : e
      );
      await saveEndpoints(updated);
    } else {
      await saveEndpoints([...endpoints.value, { ...endpoint, id: Date.now().toString() }]);
    }
    editingEndpoint.value = null;
    showModal.value = false;
  };

  const handleDelete = async (id: string) => {
    const updated = endpoints.value.filter(e => e.id !== id);
    await saveEndpoints(updated);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          API Endpoints
        </Text>
        
        {endpoints.value.map((endpoint) => (
          <View key={endpoint.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {endpoint.type !== 'custom' && (
                  <Image
                    source={endpoint.type === 'anthropic' 
                      ? require('@/assets/images/anthropic-icon.png')
                      : endpoint.type === 'openai'
                        ? require('@/assets/images/openai-icon.png')
                        : require('@/assets/images/ollama-icon.png')}
                    className="!w-[64px] !h-[64px] mr-2"
                  />
                )}
                <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {endpoint.name}
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => {
                    editingEndpoint.value = endpoint;
                    showModal.value = true;
                  }}
                  className="p-2"
                >
                  <Ionicons name="pencil" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(endpoint.id ?? '')}
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
          editingEndpoint.value = null;
          showModal.value = true;
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <EndpointModal
        visible={showModal.value}
        onClose={() => {
          showModal.value = false;
          editingEndpoint.value = null;
        }}
        onSave={handleSave}
        endpoint={editingEndpoint.value}
      />
    </View>
  );
}

interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (endpoint: APIEndpoint) => void;
  endpoint: APIEndpoint | null;
}

function EndpointModal({ visible, onClose, onSave, endpoint }: EndpointModalProps) {
  const name = useSignal(endpoint?.name ?? '');
  const apiKey = useSignal(endpoint?.apiKey ?? '');
  const selectedType = useSignal<APIEndpoint['type']>(endpoint?.type ?? 'custom');
  const customEndpoint = useSignal(endpoint?.endpoint ?? '');

  useEffect(() => {
    if (endpoint) {
      name.value = endpoint.name ?? '';
      apiKey.value = endpoint.apiKey ?? '';
      selectedType.value = endpoint.type;
      customEndpoint.value = endpoint.endpoint;
    } else {
      name.value = '';
      apiKey.value = '';
      selectedType.value = 'custom';
      customEndpoint.value = '';
    }
  }, [endpoint]);

  const handleSave = () => {
    const endpointUrl = selectedType.value === 'custom' 
      ? customEndpoint.value 
      : PREDEFINED_ENDPOINTS[selectedType.value].endpoint;

    onSave({
      id: endpoint?.id ?? '',
      name: name.value,
      endpoint: endpointUrl,
      apiKey: apiKey.value,
      type: selectedType.value,
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
            {endpoint ? 'Edit API Endpoint' : 'Add API Endpoint'}
          </Text>

          <ScrollView className="flex-1">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </Text>
                <TextInput
                  value={name.value}
                  onChangeText={(text) => name.value = text}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-gray-200"
                  placeholder="Enter name"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </Text>
                <TextInput
                  value={apiKey.value}
                  onChangeText={(text) => apiKey.value = text}
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
                  {Object.entries(PREDEFINED_ENDPOINTS).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => selectedType.value = value.type}
                      className={`p-3 rounded-lg flex-row items-center ${
                        selectedType.value === value.type 
                          ? 'bg-blue-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <Text className={`${
                        selectedType.value === value.type 
                          ? 'text-white' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {value.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => selectedType.value = 'custom'}
                    className={`p-3 rounded-lg ${
                      selectedType.value === 'custom' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text className={`${
                      selectedType.value === 'custom' 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedType.value === 'custom' && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint URL
                  </Text>
                  <TextInput
                    value={customEndpoint.value}
                    onChangeText={(text) => customEndpoint.value = text}
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
