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


interface ModelSelectorProps {
  selectedModel: Model;
  onSetModel: (model: Model) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
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

  React.useEffect(() => {
    const fetchModels = async () => {
      const models = await fetchAvailableModelsV2(
        await getDefaultStore().get(availableProvidersAtom),
      );
      setModels(models);
    };
    fetchModels();
  }, []);

  async function scanOllamaProviders() {
    let ollamaEndpoints = await scanLocalOllama();
    if (!ollamaEndpoints.length) ollamaEndpoints = await scanNetworkOllama();
    const newProviders: Provider[] = ollamaEndpoints
      .map(endpoint => ({
        ...PREDEFINED_PROVIDERS.ollama,
        endpoint,
        id: Date.now().toString(),
      }))
      .filter(p => providers.find(e => e.endpoint === p.endpoint) === undefined);

    if (newProviders.length > 0) {
      setProviders([...providers, ...newProviders]);

      const models = await fetchAvailableModelsV2(
        await getDefaultStore().get(availableProvidersAtom),
      );
      setModels(models);
    } else {
      toastService.info({
        title: "Couldn't find any ollama instances",
        description:
          "Please check the help section in Settings for information on how to install and enable ollama",
      });
    }
  }

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

    const currentModel = models.find((m) => m.id === selectedModel.id);
    if (!currentModel) {
      if (defaultModel?.id && models.find((m) => m.id === defaultModel.id)) {
        onSetModel(defaultModel);
      } else {
        onSetModel(models[0]);
      }
    }
    setDropdownModell(selectedModel);
  }, [models, selectedModel.id, defaultModel, onSetModel]);

  if (!providers.filter((p) => p.capabilities?.llm).length) {
    return (
      <View className="flex flex-row gap-2">
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-primary hover:opacity-80 text-text rounded-lg p-2 border border-border"
          onPress={scanOllamaProviders}
        >
          <Ionicons name="radio-outline" size={24} color="white" />
          {Platform.OS == 'web' && <Text className="text-white pt-1">Scan for Ollama</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-background hover:opacity-80 rounded-lg p-2 border border-border"
          onPress={() => router.push("/settings/providers")}
        >
          <Ionicons name="server-outline" size={24} className="!text-text" />
          {Platform.OS == 'web' && <Text className="text-text pt-1">Manage providers</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  if (!models.length) {
    return <Text className="text-gray-500">Loading models...</Text>;
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

  function setCurrentModelAsDefault() {
    setDefaultModel(selectedModel);
    toastService.success({
      title: "Default model set",
      description: "The selected model will now be used for new threads",
    });
  }

  return (
    <View className={`flex-row gap-2 items-center ${className}`}>
      <Dropdown
        showSearch={true}
        selected={dropdownModel}
        onSelect={onModelSelect}
        children={modelList}
        className="max-w-48 overflow-hidden"
      />
      {selectedModel.id !== defaultModel?.id && (
        <TouchableOpacity
          onPress={setCurrentModelAsDefault}
          className="p-2 flex-row items-center gap-2 bg-background hover:bg-primary/20 rounded-lg border border-border h-12 shadow-sm"
        >
          <Ionicons name="star" size={20} className="!text-primary" />
          {Platform.OS == 'web' && (
            <Text className="text-primary font-medium pt-1">Set default</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
