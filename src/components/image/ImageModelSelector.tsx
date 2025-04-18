import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Model } from "@/src/types/core";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import {
  availableProvidersAtom,
  availableModelsAtom,
  defaultModelAtom,
} from "@/src/hooks/atoms";
import { PROVIDER_LOGOS } from "@/src/constants/logos";
import { ThemeProvider } from "@/src/components/ui/ThemeProvider";
import { Provider } from "@/src/types/core";
import { DropdownElement } from "@/src/components/ui/Dropdown";

import { fetchAvailableModelsV2 } from "@/src/hooks/useModels";
import { toastService } from "@/src/services/toastService";
import { Dropdown } from "@/src/components/ui/Dropdown";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EndpointModal } from "@/src/components/providers/EndpointModal";

const replicateModels = [
  "black-forest-labs/flux-schnell",
  "black-forest-labs/flux-dev",
  "black-forest-labs/flux-pro",
  "black-forest-labs/flux-1.1-pro",
];

interface ImageModelSelectorProps {
  selectedModel: Model | undefined;
  onSetModel: (model: Model) => void;
  className?: string;
}

export const ImageModelSelector: React.FC<ImageModelSelectorProps> = ({
  selectedModel,
  onSetModel,
  className,
}) => {
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const [models, setModels] = useAtom(availableModelsAtom);
  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);
  const [dropdownModel, setDropdownModel] = useState<DropdownElement | null>(
    null,
  );
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);

  React.useEffect(() => {
    let modells: Model[] = [];
    for (const replicateModel of replicateModels) {
      modells = [
        ...modells,
        ...providers
          .filter((x) => x.name?.toLowerCase().includes("replicate"))
          .map((provider) => {
            return {
              id: replicateModel,
              name: replicateModel,
              provider: provider,
            };
          }),
      ];
    }
    console.log("modells", modells);
    setModels(modells);
  }, []);

  function setDropdownModell(model: Model) {
    setDropdownModel({
      title: model.name,
      id: model.id,
      image: model.provider.logo,
    });
  }

  // Add useEffect to handle initial model selection
  React.useEffect(() => {
    if (!models.length) return;
    if (!selectedModel) selectedModel = models[0];

    const currentModel = models.find((m) => m.id === selectedModel?.id);
    if (!currentModel) {
      if (defaultModel?.id && models.find((m) => m.id === defaultModel.id)) {
        onSetModel(defaultModel);
      } else {
        onSetModel(models[0]);
      }
    }
    setDropdownModell(selectedModel);
  }, [models, selectedModel?.id, defaultModel, onSetModel]);

  const handleAddProvider = (provider: Provider) => {
    // Add the new provider
    setProviders([...providers, provider]);
    
    // Refresh models
    fetchAvailableModelsV2([provider])
      .then((fetchedModels) => {
        setModels([...models, ...fetchedModels]);
        toastService.success({
          title: "Provider added",
          description: "Image provider added successfully",
        });
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        toastService.danger({
          title: "Failed to load models",
          description: "Could not fetch models from the new provider",
        });
      });
    
    setShowAddProviderModal(false);
  };

  if (!models.length) {
    return (
      <View className="flex-1 justify-center items-center mx-auto my-auto">
        <TouchableOpacity
          onPress={() => setShowAddProviderModal(true)}
          className="bg-primary h-12 hover:opacity-80 rounded-lg p-2 border border-border text-white flex-row items-center"
        >
          <Ionicons name="add" size={16} color="white" className="mr-2" />
          <Text className="text-white flex-1">Add image provider</Text>
        </TouchableOpacity>
        <Text className="text-gray-500 mt-2">You have no image providers configured</Text>
        
        {/* Add Provider Modal */}
        <EndpointModal
          visible={showAddProviderModal}
          onClose={() => setShowAddProviderModal(false)}
          onSave={handleAddProvider}
          initialCapabilityFilter="image"
        />
      </View>
    );
  }

  let modelList = models.map((model) => ({
    title: model.name,
    id: model.id,
    image: model.provider.logo,
  }));

  function onModelSelect(model: DropdownElement) {
    setDropdownModel(model);
    onSetModel(models.find((m) => m.id === model.id)!);
  }

  return (
    <View className={className}>
      <Dropdown
        selected={dropdownModel}
        onSelect={onModelSelect}
        children={modelList}
        className="bg-surface"
      />
    </View>
  );
};
