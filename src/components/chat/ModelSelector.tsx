import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, Platform } from 'react-native';
import { Model } from '@/src/types/core';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { availableProvidersAtom, availableModelsAtom, defaultModelAtom } from '@/src/hooks/atoms';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ThemeProvider } from '@/src/components/ui/ThemeProvider';
import { Provider } from '@/src/types/core';
import { DropdownElement } from '@/src/components/ui/Dropdown';

import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import { fetchAvailableModelsV2 } from '@/src/hooks/useModels';
import { scanLocalOllama, scanNetworkOllama } from '@/src/components/providers/providers';
import { toastService } from '@/src/services/toastService';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { Platform as PlatformUtils } from '@/src/utils/platform';
import { Ionicons } from '@expo/vector-icons';



interface ModelSelectorProps {
  selectedModel: Model;
  onSetModel: (model: Model) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel,
  onSetModel,
  className
}) => {
  const [providers, setProviders] = useAtom(availableProvidersAtom);
  const [models, setModels] = useAtom(availableModelsAtom);
  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);
  const [dropdownModel, setDropdownModel] = useState<DropdownElement | null>(null);

  React.useEffect(() => {
    const fetchModels = async () => {
      
      const models = await fetchAvailableModelsV2(await getDefaultStore().get(availableProvidersAtom));
      setModels(models);


      if(!models.length && !providers.length && !PlatformUtils.isWeb) {
        
      }
      
    };
    fetchModels();
  }, []);

  async function scanOllamaProviders(){
    let ollamaEndpoints = await scanLocalOllama();
    if(!ollamaEndpoints.length) ollamaEndpoints = await scanNetworkOllama();
    const newProviders: Provider[] = ollamaEndpoints.map((endpoint) => ({
      endpoint,
      id: Date.now().toString(),
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
      
      const models = await fetchAvailableModelsV2(await getDefaultStore().get(availableProvidersAtom));
      setModels(models);
    }
    else{
      toastService.info({
        title: 'Couldn\'t find any ollama instances',
        description: 'Please check the help section in Settings for information on how to install and enable ollama'
      });
    }
  }

  function setDropdownModell(model: Model) {
    setDropdownModel({
      title: model.name,
      id: model.id,
      image: PROVIDER_LOGOS[model.provider.source as keyof typeof PROVIDER_LOGOS]
    });
  }

  // Add useEffect to handle initial model selection
  React.useEffect(() => {
    if (!models.length) return;
    
    const currentModel = models.find(m => m.id === selectedModel.id);
    if (!currentModel) {
      if (defaultModel?.id && models.find(m => m.id === defaultModel.id)) {
        onSetModel(defaultModel);
      } else {
        onSetModel(models[0]);
      }
    }
    setDropdownModell(selectedModel);
  }, [models, selectedModel.id, defaultModel, onSetModel]);



  if(!providers.length) return <TouchableOpacity className="flex-row items-center gap-2 bg-primary hover:opacity-80 text-white rounded-lg p-2 border border-border" onPress={scanOllamaProviders}>
    <Ionicons name="radio-outline" size={24} color="white" />
    Scan for Ollama
    </TouchableOpacity>;
  
  if (!models.length) {
    return <Text className="text-gray-500">Loading models...</Text>;
  }

  // Remove the model selection logic from render phase
  const currentModel = models.find(m => m.id === selectedModel.id);
  

  let modelList = models.map((model) => ({
    title: model.name,
    id: model.id,
    image: PROVIDER_LOGOS[model.provider.source as keyof typeof PROVIDER_LOGOS]
  }));

  function onModelSelect(model: DropdownElement) {
    setDropdownModel(model);
    onSetModel(models.find(m => m.id === model.id)!);
  }

  function setCurrentModelAsDefault() {
    setDefaultModel(selectedModel);
    toastService.success({
      title: "Default model set",
      description: "The selected model will now be used as the default model"
    });
  }

  // modelList = [...modelList, ...(modelList.map(x=>({...x, id: "wuut"})))];


  return (
    <View className={`flex-row gap-2 items-center ${className}`}>
      <Dropdown showSearch={true} selected={dropdownModel} onSelect={onModelSelect} children={modelList}/>
      {selectedModel.id !== defaultModel?.id && (
          <TouchableOpacity 
            onPress={setCurrentModelAsDefault}
            className="p-2 flex items-center justify-center bg-primary hover:opacity-80 rounded-lg border border-border h-12"
          >
            <Text className="text-white">Set as default model</Text>
          </TouchableOpacity>
        )}
    </View>
  );
}; 
