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
  selectedModel: Model;
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
  const [dropdownModel, setDropdownModel] = useState<DropdownElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [models, setModels] = useAtom(availableModelsAtom);
  const [modelOptions, setModelOptions] = useState<Model[]>(models);

  useEffect(() => {
    // Check if character has a required model
    if (character?.modelPreferences) {
      const requiredPreference = character.modelPreferences.find(p => p.level === 'required');
      
      if (requiredPreference) {
        const compatibleModels = getCompatibleModels(character, models);
        setModelOptions(compatibleModels);

        if(compatibleModels.length == 0){
          setIsDisabled(true);
          toastService.danger({
            title: "No compatible model found",
            description: "This character requires a specific model that is not available."
          });
        }
        else{
          setIsDisabled(false);
          onModelSelect(compatibleModels[0]);
        }
        
        
      } else {
        setIsDisabled(false);
      }
    } else {
      setIsDisabled(false);
    }
  }, [character, models, selectedModel.id]);

  useEffect(() => {
    // Update dropdown model when selected model changes
    const model = models.find(m => m.id === selectedModel.id);
    if (model) {
      setDropdownModel({
        id: model.id,
        title: model.name,
        image: model.provider.logo
      });
    }
  }, [selectedModel, models]);

  const modelList: ModelDropdownElement[] = modelOptions.map(model => ({
    id: model.id,
    title: model.name,
    image: model.provider.logo,
    model: model
  }));

  const handleModelSelect = (item: DropdownElement) => {
    if (isDisabled) return;
    onModelSelect(modelOptions.find((m) => m.id === item.id)!);
    setDropdownModel(item);
  };

  function setCurrentModelAsDefault() {
    setDefaultModel(selectedModel);
    toastService.success({
      title: "Default model set",
      description: "The selected model will now be used for new threads",
    });
  }

  function scanOllamaProviders() {
    scanLocalOllama();
    scanNetworkOllama();
  }

  const getCompatibleModels = (character: Character, availableModels: Model[]): Model[] => {
    // If character has no model preferences, any model is compatible
    if (!character.modelPreferences || character.modelPreferences.length === 0) {
      return availableModels; // Null means any model is compatible
    }
    console.log("character preferences", character.modelPreferences);

    // Check for required models first
    const requiredPreferences = character.modelPreferences.filter(p => p.level === 'required');
    if (requiredPreferences.length > 0) {
      // Find the first available required model
      console.log("Available models", availableModels);
      return availableModels.filter(m => requiredPreferences.some(p => p.modelId === m.id));
    }

    return [];
  };

  console.log("We have providers", providers);

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

  return (
    <View className={`flex-row gap-2 items-center ${className}`}>
      <Dropdown
        showSearch={true}
        selected={dropdownModel}
        onSelect={handleModelSelect}
        children={modelList}
        className={`max-w-48 overflow-hidden ${isDisabled ? 'opacity-70' : ''}`}
        position="right"
      />
      
      
      {!isDisabled && selectedModel.id !== defaultModel?.id && (
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
