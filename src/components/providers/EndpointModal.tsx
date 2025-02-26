import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useEffect, useState } from "react";
import { Provider } from "@/src/types/core";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";
import { ProviderFormFields } from "./ProviderFormFields";
import { PROVIDER_LOGOS } from "@/src/constants/logos";
import { Modal } from "@/src/components/ui/Modal";
import { EditOllama } from "./EditOllama";
import { toastService } from "@/src/services/toastService";

interface EndpointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (provider: Provider) => void;
  initialProvider?: Provider;
}

export function EndpointModal({
  visible,
  onClose,
  onSave,
  initialProvider,
}: EndpointModalProps) {
  const [formData, setFormData] = useState<Omit<Provider, 'id'>>({
    name: PREDEFINED_PROVIDERS.ollama.name,
    endpoint: PREDEFINED_PROVIDERS.ollama.endpoint,
    apiKey: '',
    capabilities: PREDEFINED_PROVIDERS.ollama.capabilities,
    logo: PREDEFINED_PROVIDERS.ollama.logo,
  });

  useEffect(() => {
    if (visible) {
      setFormData(initialProvider ?? {
        name: PREDEFINED_PROVIDERS.ollama.name,
        endpoint: PREDEFINED_PROVIDERS.ollama.endpoint,
        apiKey: '',
        capabilities: PREDEFINED_PROVIDERS.ollama.capabilities,
        logo: PREDEFINED_PROVIDERS.ollama.logo,
      });
    }
  }, [visible, initialProvider]);

  const handleSave = () => {
    console.log("formData", formData);
    if (formData.name?.trim() === '') {
      toastService.danger({
        title: 'Name Required',
        description: 'Please enter a name for this provider.',
      });
      return;
    }

    // For providers that require API keys
    if (formData.keyRequired && !formData.apiKey) {
      toastService.danger({
        title: 'API Key Required',
        description: 'Please enter an API key for this provider.',
      });
      return;
    }

    onSave({
      id: initialProvider?.id ?? Date.now().toString(),
      ...formData,
    });
  };

  const isOllama = formData.name?.toLowerCase().includes('ollama');

  return (
    <Modal isVisible={visible} onClose={onClose} maxHeight="85%">
      <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="flex-row items-center mb-6">
          {formData.logo && (
            <Image
              source={{ uri: formData.logo }}
              className="!w-[48px] !h-[48px] rounded-full mr-3"
            />
          )}
          <Text className="text-xl font-bold text-text">
            {initialProvider ? "Edit Provider" : "Add Provider"}
          </Text>
        </View>

        <ProviderFormFields
          formData={formData}
          onChange={(updates) => {
            console.log("updates", updates);
            setFormData(prev => ({ ...prev, ...updates }));
          }}
        />

        {isOllama && initialProvider && (
          <EditOllama provider={initialProvider} />
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
          <Text className="text-center text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
