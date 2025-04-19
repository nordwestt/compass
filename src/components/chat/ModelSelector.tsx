import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Model, Character } from "@/src/types/core";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import {
  availableProvidersAtom,
  availableModelsAtom,
  defaultModelAtom,
} from "@/src/hooks/atoms";
import { PROVIDER_LOGOS } from "@/src/constants/logos";
import { Provider } from "@/src/types/core";
import { DropdownElement } from "@/src/components/ui/Dropdown";

import { fetchAvailableModelsV2 } from "@/src/hooks/useModels";
import {
  scanLocalOllama,
  scanNetworkOllama,
} from "@/src/components/providers/providers";
import { toastService } from "@/src/services/toastService";
import { Dropdown } from "@/src/components/ui/Dropdown";
import { Platform as PlatformUtils } from "@/src/utils/platform";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PREDEFINED_PROVIDERS } from "@/src/constants/providers";

// Extend DropdownElement to include a model property
interface ModelDropdownElement extends DropdownElement {
  model: Model;
}

interface ModelSelectorProps {
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  character?: Character;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  character,
  className,
}) => {
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);
  const [dropdownModel, setDropdownModel] = useState<DropdownElement | null>(
    null,
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [models, setModels] = useAtom(availableModelsAtom);
  const [modelOptions, setModelOptions] = useState<Model[]>(models);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    // Check if character has a required model
    const compatibleModels = getCompatibleModels(character, models);
    setModelOptions(compatibleModels);

    if (compatibleModels.length == 0 && models.length > 0) {
      setIsDisabled(true);
      toastService.danger({
        title: "No compatible model found",
        description:
          "This character requires a specific model that is not available.",
      });
    } else {
      setIsDisabled(false);
      if (
        !selectedModel ||
        !compatibleModels.find((m) => m.id === selectedModel?.id)
      ) {
        onModelSelect(compatibleModels[0]);
      }
    }
  }, [character, models, selectedModel?.id]);

  useEffect(() => {
    // Update dropdown model when selected model changes
    const model = models.find((m) => m.id === selectedModel?.id);
    if (model) {
      setDropdownModel({
        id: model.id,
        title: model.name,
        image: model.provider.logo,
      });
    }
  }, [selectedModel, models]);

  // Add effect to automatically load models when we have providers but no models
  useEffect(() => {
    const llmProviders = providers.filter((p) => p.capabilities?.llm);
    if (llmProviders.length > 0 && models.length === 0) {
      setIsLoadingModels(true);
      fetchAvailableModelsV2(llmProviders)
        .then((fetchedModels) => {
          setModels(fetchedModels);
        })
        .catch((error) => {
          console.error("Error fetching models:", error);
          toastService.danger({
            title: "Failed to load models",
            description: "Could not fetch models from providers",
          });
        })
        .finally(() => {
          setIsLoadingModels(false);
        });
    }
  }, [providers, models.length]);

  const modelList: ModelDropdownElement[] = modelOptions.map((model) => ({
    id: model.id,
    title: model.name,
    image: model.provider.logo,
    model: model,
  }));

  const handleModelSelect = (item: DropdownElement) => {
    if (isDisabled) return;
    onModelSelect(modelOptions.find((m) => m.id === item.id)!);
    setDropdownModel(item);
  };

  function setCurrentModelAsDefault() {
    if (selectedModel) {
      setDefaultModel(selectedModel);
      toastService.success({
        title: "Default model set",
        description: "The selected model will now be used for new threads",
      });
    }
  }

  async function scanOllamaProviders() {
    let ollamaEndpoints = await scanLocalOllama();
    if (!ollamaEndpoints.length) ollamaEndpoints = await scanNetworkOllama();
    const newProviders: Provider[] = ollamaEndpoints
      .map((endpoint) => ({
        ...PREDEFINED_PROVIDERS.ollama,
        endpoint,
        id: Date.now().toString(),
      }))
      .filter(
        (p) => providers.find((e) => e.endpoint === p.endpoint) === undefined,
      );

    if (newProviders.length > 0) {
      setProviders([...providers, ...newProviders]);

      // const models = await fetchAvailableModelsV2(
      //   await getDefaultStore().get(availableProvidersAtom),
      // );
      // setModels(models);
    } else {
      toastService.info({
        title: "Couldn't find any ollama instances",
        description:
          "Please check the help section in Settings for information on how to install and enable ollama",
      });
    }
  }

  const getCompatibleModels = (
    character: Character | undefined,
    availableModels: Model[],
  ): Model[] => {
    // If character has no model preferences, any model is compatible
    if (!character?.allowedModels || character.allowedModels.length === 0) {
      return availableModels; // Null means any model is compatible
    }

    console.log("Character preferences", character.allowedModels);

    // Check for required models first
    if (character.allowedModels?.length > 0) {
      // Find the first available required model
      return availableModels.filter((m) =>
        character.allowedModels?.some((p) => p.id === m.id),
      );
    }

    return [];
  };

  if (!providers.filter((p) => p.capabilities?.llm).length) {
    return (
      <View className="flex flex-row gap-2">
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-primary hover:opacity-80 text-text rounded-lg p-2 border border-border"
          onPress={scanOllamaProviders}
        >
          <Ionicons name="radio-outline" size={24} color="white" />
          {Platform.OS == "web" && (
            <Text className="text-white pt-1">Scan for Ollama</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-background hover:opacity-80 rounded-lg p-2 border border-border"
          onPress={() => router.push("/settings/providers")}
        >
          <Ionicons name="server-outline" size={24} className="!text-text" />
          {Platform.OS == "web" && (
            <Text className="text-text pt-1">Manage providers</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!models.length) {
    return (
      <View className="flex-row gap-2 items-center">
        <Text className="text-gray-500">Loading models...</Text>
        <TouchableOpacity
          className="ml-2 p-2 rounded-lg bg-background border border-border"
          onPress={() => {
            setIsLoadingModels(true);
            fetchAvailableModelsV2(providers.filter((p) => p.capabilities?.llm))
              .then((fetchedModels) => {
                setModels(fetchedModels);
              })
              .finally(() => {
                setIsLoadingModels(false);
              });
          }}
        >
          <Ionicons name="refresh-outline" size={16} className="!text-text" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-row gap-2 items-center ${className}`}>
      <Dropdown
        showSearch={true}
        selected={dropdownModel}
        onSelect={handleModelSelect}
        children={modelList}
        className={`max-w-48 overflow-hidden`}
        position="right"
      />

    </View>
  );
};
