import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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

  return (
    <View className={`flex-1 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <ScrollView className="p-4" contentContainerStyle={{ flexGrow: 0 }}>
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
          API Providers
        </Text>

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
