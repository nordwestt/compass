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
import { Model, Character, Thread } from "@/src/types/core";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import {
  availableProvidersAtom,
  availableModelsAtom,
  defaultModelAtom,
  charactersAtom,
  selectedChatDropdownOptionAtom,
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
import { useLocalization } from "@/src/hooks/useLocalization";

// Extend DropdownElement to include a model property
interface ModelDropdownElement extends DropdownElement {
  model: Model;
}

interface ModelSelectorProps {
  thread: Thread;
  onModelSelect: (model: Model) => void;
  onCharacterSelect: (character: Character) => void;
  character?: Character;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  thread,
  onModelSelect,
  onCharacterSelect,
  character,
  className,
}) => {
  const { t } = useLocalization();
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const characters = useAtomValue(charactersAtom);
  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);
  const [dropdownModel, setDropdownModel] = useState<DropdownElement | null>(
    null,
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [models, setModels] = useAtom(availableModelsAtom);
  const [modelOptions, setModelOptions] = useState<Model[]>(models);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownElement[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] = useAtom(selectedChatDropdownOptionAtom);
  useEffect(() => {
    // Check if character has a required model

    let options: DropdownElement[] = [];
    options.push(...models.map((model) => ({
      id: model.id,
      title: model.name,
      image: model.provider.logo,
      model: model,
    })));

    options.push(...characters.map((character) => ({
      id: character.id,
      title: character.name,
      image: character.image,
      icon: character.icon,
      character: character,
    })));

    setDropdownOptions(options);

  }, [characters, models]);

  useEffect(() => {
    // Update dropdown model when selected model changes
    const model = models.find((m) => m.id === thread.selectedModel?.id);
    const character = characters.find((c) => c.id === thread.character?.id);
    if(character){
      setSelectedDropdownOption({
        id: character.id,
        title: character.name,
        image: character.image,
        icon: character.icon
      });
    }
    else if (thread.messages.length > 0 && thread.selectedModel) {
      setSelectedDropdownOption({
        id: thread.selectedModel.id,
        title: thread.selectedModel.name,
        image: thread.selectedModel.provider.logo
      });
    }
  }, [thread.selectedModel, thread.character]);

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
            title: t('settings.providers.failed_to_load_models'),
            description: t('settings.providers.models_fetch_error'),
          });
        })
        .finally(() => {
          setIsLoadingModels(false);
        });
    }
  }, [providers, models.length]);


  const handleDropdownSelect = (item: DropdownElement) => {
    if (isDisabled) return;
    if(models.find((m) => m.id === item.id)) {
      onModelSelect(models.find((m) => m.id === item.id)!);
    } else if(characters.find((c) => c.id === item.id)) {
      onCharacterSelect(characters.find((c) => c.id === item.id)!);
    }
    setSelectedDropdownOption(item);
  };

  // function setCurrentModelAsDefault() {
  //   if (selectedModel) {
  //     setDefaultModel(selectedModel);
  //     toastService.success({
  //       title: t('chats.default_model_set'),
  //       description: t('chats.selected_model_will_now_be_used_for_new_threads'),
  //     });
  //   }
  // }

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

    } else {
      toastService.info({
        title: t('settings.providers.auto_detect_ollama'),
        description: t('settings.help.ollama.connect_description'),
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
            <Text className="text-white pt-1">{t('models.scan_for_ollama')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-2 bg-background hover:opacity-80 rounded-lg p-2 border border-border"
          onPress={() => router.push("/settings/providers")}
        >
          <Ionicons name="server-outline" size={24} className="!text-text" />
          {Platform.OS == "web" && (
            <Text className="text-text pt-1">{t('models.manage_providers')}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!models.length) {
    return (
      <View className="flex-row gap-2 items-center">
        <Text className="text-gray-500">{t('models.loading_models')}</Text>
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
        selected={selectedDropdownOption}
        onSelect={handleDropdownSelect}
        children={dropdownOptions}
        className={`w-48 overflow-hidden bg-surface`}
        dropdownOptionClassName="w-64"
        position="left"
      />
    </View>
  );
};
