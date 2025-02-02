import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getDefaultStore, useAtom } from 'jotai';
import { availableProvidersAtom, logsAtom, availableModelsAtom } from '@/src/hooks/atoms';
import { ProviderCard } from '@/src/components/providers/ProviderCard';
import { EndpointModal } from '@/src/components/providers/EndpointModal';
import { useState } from 'react';
import { Provider } from '@/src/types/core';
import NetInfo from '@react-native-community/netinfo';
import LogService from '@/utils/LogService';
import { fetchAvailableModelsV2 } from '@/src/hooks/useModels';
import { toastService } from '@/src/services/toastService';
import { EditOllama } from './EditOllama';
import { router } from 'expo-router';


interface ProvidersProps {
  className?: string;
}

export default function Providers({ className }: ProvidersProps) {
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const [logs, setLogs] = useAtom(logsAtom);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [scanning, setScanning] = useState(false);
  const [models, setModels] = useAtom(availableModelsAtom);
  
  const handleSave = async (provider: Provider) => {
    if (editingProvider) {
      const updated = providers.map((e) => (e.id === editingProvider.id ? provider : e));
      await setProviders(updated);
    } else {
      await setProviders([...providers, { ...provider, id: Date.now().toString() }]);
    }
    setEditingProvider(null);
    setShowModal(false);

    fetchAvailableModelsV2(await getDefaultStore().get(availableProvidersAtom)).then((modelsFound) => {
      setModels(modelsFound);
      
    });

    toastService.success({ title: 'Provider saved', description: 'Provider saved successfully' });
  };

  const handleDelete = async (id: string) => {
    const updated = providers.filter((e) => e.id !== id);
    setProviders(updated);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    console.log("editing provider", provider);
    setShowModal(true);
  };

  const autoScanForOllama = async () => {

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Fine Location Permission',
          message:
            'Compass needs access to your location ' +
            'so it can scan for Ollama instances on your network.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    }

    
    

    setScanning(true);
    try{
    scanForOllamaInstances().then((ollamaEndpoints) => {
      const newProviders: Provider[] = ollamaEndpoints.map((endpoint) => ({
        endpoint,
        id: Date.now().toString() + endpoint,
        name: "Ollama",
        source: 'ollama',
        capabilities: {
          llm: true,
          tts: false,
          stt: false,
          search: false
        }
      } as Provider)).filter(p => providers.find(e => e.endpoint === p.endpoint) === undefined);

      if(newProviders.length > 0) {
        setProviders([...providers, ...newProviders]);
        console.log('Provider added');
        toastService.success({
          title: 'Provider added',
          description: `${newProviders.length} new Ollama instances were found`
        });
      }
      else{
        toastService.info({
          title: 'No new Ollama instances found',
          description: 'Couldn\'t find any new Ollama instances on your network'
        });
      }
    }).finally(() => {
      setScanning(false);
      });
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  return (
    <View className={`flex-1 ${className}`}>
      <ScrollView className="p-4" contentContainerStyle={{ flexGrow: 0 }}>
        
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold mb-4 text-text">
            API Providers
          </Text>
          <TouchableOpacity
                onPress={() => {
                  setEditingProvider(null);
                  setShowModal(true);
                }}
                className="bg-primary px-4 py-2 rounded-lg flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">New Provider</Text>
              </TouchableOpacity>
          </View>

        {providers.map((provider, index) => (
          <ProviderCard className={`border-b border-border ${index % 2 === 1 ? 'bg-surface' : ''}`}
            key={provider.id}
            provider={provider}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ScrollView>
      <View className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mb-6">
          <TouchableOpacity 
            className="flex-row items-center justify-center bg-primary rounded-lg p-4" 
            onPress={autoScanForOllama}
          >
            <Ionicons 
              name="scan-outline" 
              size={24} 
              color="white" 
              style={{ marginRight: 8 }} 
            />
            <Text className="text-white text-lg font-semibold">
              {scanning ? 'Scanning for Ollama...' : 'Auto-detect Ollama'}
            </Text>
            {scanning && (
              <ActivityIndicator 
                size="small" 
                color="white" 
                style={{ marginLeft: 8 }} 
              />
            )}
          </TouchableOpacity>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
            Automatically detect Ollama instances running on your network
          </Text>
        </View>

      
      
      <EndpointModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProvider(null);
        }}
        onSave={handleSave}
        provider={editingProvider}
        editing={editingProvider != null}
      />
    </View>
  );

}


export async function scanForOllamaInstances(): Promise<string[]> {
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

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/text',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.status === 200 ? endpoint : null;
    } catch (error: any) {
      return null;
    }
  };

  let results: string[] = [];
  // Process endpoints in batches
  for (let i = 0; i < networkPatterns.length; i += BATCH_SIZE) {
    const batch = networkPatterns.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(testEndpoint));
    results = [...results, ...batchResults.filter(result => result !== null)];
  }

  // if we have both localhost and 127.0.0.1, remove 127.0.0.1
  if (results.includes('http://localhost:11434') && results.includes('http://127.0.0.1:11434')) {
    results = results.filter(result => result !== 'http://127.0.0.1:11434');
  }

  if(results.length>1 && results.includes('http://localhost:11434')){
    // make request to /api/tags
    const localResponse = await fetch(`http://localhost:11434/api/tags`);
    const localData = await localResponse.json();

    const otherEndpoints = results.filter(result => result !== 'http://localhost:11434');
    for(let i = 0; i < otherEndpoints.length; i++){
      const response = await fetch(`${otherEndpoints[i]}/api/tags`);
      const responseData = await response.json();
      if(localData.toString() == responseData.toString()){
        results = results.filter(result => result != otherEndpoints[i]);
      }
    }
  }

  return results;
}