import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getDefaultStore, useAtom } from "jotai";
import {
  availableProvidersAtom,
  logsAtom,
  availableModelsAtom,
  polarisProvidersAtom,
  polarisModelsAtom,
  polarisServerAtom,
} from "@/src/hooks/atoms";
import { ProviderCard } from "@/src/components/providers/ProviderCard";
import { EndpointModal } from "@/src/components/providers/EndpointModal";
import { useState } from "react";
import { Provider } from "@/src/types/core";
import NetInfo from "@react-native-community/netinfo";
import LogService from "@/utils/LogService";
import { fetchAvailableModelsV2 } from "@/src/hooks/useModels";
import { toastService } from "@/src/services/toastService";
import { EditOllama } from "../providers/EditOllama";
import { router } from "expo-router";
import { getProxyUrl } from "@/src/utils/proxy";
import ProviderService from "@/src/services/provider/ProviderService";
import PolarisServer from "@/src/services/polaris/PolarisServer";
import { MicrosoftAuthModal } from "../providers/MicrosoftAuthModal";

interface ProvidersProps {
  className?: string;
}

export default function Providers({ className }: ProvidersProps) {
  const [providers, setProviders] = useAtom(polarisProvidersAtom);
  const [models, setModels] = useAtom(polarisModelsAtom);
  const [logs, setLogs] = useAtom(logsAtom);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | undefined>(
    undefined,
  );
  const [scanning, setScanning] = useState(false);
  const [polarisServer, setPolarisServer] = useAtom(polarisServerAtom);

  const loadProvidersAndModels = async () =>{
    const providers = await PolarisServer.getProviders();
    await setProviders(providers);

    let models = await PolarisServer.getModels();
    models.forEach((x) => {
      const provider = providers.find((y) => y.id == x.providerId);
      if (provider) {
        x.provider = {
          id: provider.id,
          name: provider.name,
          isServerResource: provider.isServerResource,
          endpoint: provider.endpoint,
          logo: provider.logo,
        };
      }
    });
    setModels(models);
  }

  const handleSave = async (provider: Provider) => {
    if (provider.isServerResource) {
      // Update existing server provider
      await PolarisServer.updateProvider(provider);
    } else {
      // Create new server provider
      await PolarisServer.createProvider(provider);
    }

    await loadProvidersAndModels();

    setEditingProvider(undefined);
    setShowModal(false);

    toastService.success({
      title: "Provider saved",
      description: "Provider saved successfully",
    });
  };

  const handleDelete = async (provider: Provider) => {
    try {
      await PolarisServer.deleteProvider(provider.id);
    } catch (error: any) {
      LogService.log(
        error,
        { component: "providersAtom", function: "setter" },
        "error",
      );
      toastService.danger({
        title: "Error",
        description: `Failed to delete provider: ${provider.name}`,
      });
    }
    await loadProvidersAndModels();
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    console.log("editing provider", provider);
    setShowModal(true);
  };

  const handleRefresh = async (provider: Provider) => {
    const res = await PolarisServer.syncAllModels();
    if (res) {
      await loadProvidersAndModels();
      toastService.success({
        title: "Success",
        description: "Providers and models refreshed successfully",
      });
    } else {
      toastService.danger({
        title: "Error",
        description: "Failed to refresh providers and models",
      });
    }
  };

  const handleAuthSuccess = async () => {
    // Refresh providers and models after successful authentication
    await loadProvidersAndModels();
  };

  return (
    <View className={`flex-1 ${className}`}>
      <ScrollView className="p-4" contentContainerStyle={{ flexGrow: 0 }}>
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center p-4">
            <Ionicons
              name="git-branch"
              size={32}
              className="!text-primary mr-2 pb-2"
            />
            <Text className="text-2xl font-bold text-primary">Providers</Text>
          </View>
          <View className="flex-row">
            {!polarisServer && (
              <TouchableOpacity
                onPress={() => setShowAuthModal(true)}
                className="bg-[#2F2F2F] px-4 py-2 rounded-lg flex-row items-center mr-2"
              >
                <Ionicons name="log-in" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Connect to Polaris</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setEditingProvider(undefined);
                setShowModal(true);
              }}
              className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">Add Provider</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center py-2">
          <Ionicons
            name="information-circle-outline"
            size={20}
            className="!text-primary mr-2"
          />
          <Text className="text-text flex-1 font-medium pt-1">
            Providers provide different services to the app, such as text
            generation, image generation, search, and more.
          </Text>
        </View>

        <View className="md:gap-4 gap-2 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider, index) => (
            <View key={provider.id} className="w-full">
              <ProviderCard
                className="bg-surface rounded-xl shadow-lg"
                provider={provider}
                onRefresh={handleRefresh}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <EndpointModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProvider(undefined);
        }}
        onSave={handleSave}
        initialProvider={editingProvider}
      />
    </View>
  );
}
