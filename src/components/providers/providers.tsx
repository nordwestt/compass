import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { availableProvidersAtom } from '@/hooks/atoms';
import { ProviderCard } from '@/src/components/providers/ProviderCard';
import { EndpointModal } from '@/src/components/providers/EndpointModal';
import { useState } from 'react';
import { Provider } from '@/types/core';
interface ProvidersProps {
  className?: string;
}

export default function Providers({ className }: ProvidersProps) {
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [scanning, setScanning] = useState(false);
  const handleSave = async (provider: Provider) => {
    if (editingProvider) {
      const updated = providers.map((e) => (e.id === editingProvider.id ? provider : e));
      setProviders(updated);
    } else {
      setProviders([...providers, { ...provider, id: Date.now().toString() }]);
    }
    setEditingProvider(null);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const updated = providers.filter((e) => e.id !== id);
    setProviders(updated);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const autoScanForOllama = () => {
    setScanning(true);
    scanForOllamaInstances().then((ollamaEndpoints) => {
      setProviders(ollamaEndpoints.map((endpoint) => ({
        endpoint,
        name: "Ollama",
        source: 'ollama',
        capabilities: {
          llm: true,
          tts: false,
          stt: false
        }
      })));
    }).finally(() => {
      setScanning(false);
    });
  };

  return (
    <View className={`flex-1 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <ScrollView className="p-4" contentContainerStyle={{ flexGrow: 0 }}>
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
          API Providers
        </Text>
        <TouchableOpacity className="bg-blue-500 rounded-lg p-2 mb-4" onPress={autoScanForOllama}>
          <Text className="text-white">Scan for Ollama</Text>
          {scanning && <ActivityIndicator size="small" color="white" />}
        </TouchableOpacity>

        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <TouchableOpacity
          onPress={() => {
            setEditingProvider(null);
          setShowModal(true);
          }}
          className="w-14 h-14 mx-auto bg-blue-500 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </ScrollView>

      

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

async function scanForOllamaInstances(): Promise<string[]> {
  const endpoints: string[] = [];
  
  // Common local network patterns
  const networkPatterns = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
  ];

  // Generate IP range for 192.168.1.x
  // for (let i = 1; i <= 254; i++) {
  //   networkPatterns.push(`http://192.168.1.${i}:11434`);
  // }
  networkPatterns.push('http://192.168.1.76:11434');

  // Generate IP range for 192.168.0.x
  // for (let i = 1; i <= 254; i++) {
  //   networkPatterns.push(`http://192.168.0.${i}:11434`);
  // }

  // Test each endpoint with a timeout
  const testEndpoint = async (endpoint: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

      const response = await fetch(`${endpoint}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        endpoints.push(endpoint);
      }
    } catch (error) {
      // Ignore connection errors
      console.log('error', error);
    }
  };

  // Run all tests concurrently with Promise.all
  await Promise.all(networkPatterns.map(testEndpoint));

  console.log('networkPatterns', networkPatterns);
  console.log('endpoints', endpoints);

  // register the endpoints
  
  
  return endpoints;
}
