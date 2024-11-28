import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { availableProvidersAtom } from '@/hooks/atoms';
import { ProviderCard } from '@/src/components/providers/ProviderCard';
import { EndpointModal } from '@/src/components/providers/EndpointModal';
import { useState } from 'react';
import { Provider } from '@/types/core';
import NetInfo from '@react-native-community/netinfo';

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
        id: Date.now().toString(),
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
        <TouchableOpacity className="bg-primary rounded-lg p-2 mb-4" onPress={autoScanForOllama}>
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
          className="w-14 h-14 mx-auto bg-primary rounded-full items-center justify-center shadow-lg"
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
  // Get network info
  const networkState = await NetInfo.fetch();
  const networkPatterns: string[] = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
  ];

  if (networkState.type === 'wifi' && networkState.details?.ipAddress && networkState.details?.subnet) {
    // Extract subnet from IP and subnet mask
    const subnet = networkState.details.ipAddress.split('.').slice(0, 3).join('.');
    // Generate IPs only for the detected subnet
    for (let i = 1; i <= 254; i++) {
      networkPatterns.push(`http://${subnet}.${i}:11434`);
    }
  } else {
    // Fallback to checking common subnets if we can't determine the current network
    for (let i = 1; i <= 254; i++) {
      networkPatterns.push(`http://192.168.0.${i}:11434`);
    }
    for (let i = 1; i <= 254; i++) {
      networkPatterns.push(`http://192.168.1.${i}:11434`);
    }
  }

  // Batch size of concurrent requests
  const BATCH_SIZE = 25;
  const TIMEOUT_MS = 500;

  // Modified test endpoint function that resolves as soon as a valid endpoint is found
  const testEndpoint = async (endpoint: string): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(`${endpoint}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok ? endpoint : null;
    } catch (error) {
      return null;
    }
  };

  // Process endpoints in batches
  for (let i = 0; i < networkPatterns.length; i += BATCH_SIZE) {
    const batch = networkPatterns.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(testEndpoint));
    
    // Find first successful result
    const foundEndpoint = results.find(result => result !== null);
    if (foundEndpoint) {
      return [foundEndpoint];
    }
  }

  return [];
}
