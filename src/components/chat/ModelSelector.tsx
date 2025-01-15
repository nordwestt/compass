import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, Platform } from 'react-native';
import { Signal } from '@preact/signals-react';
import { Model } from '@/types/core';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { availableProvidersAtom, availableModelsAtom, defaultModelAtom } from '@/hooks/atoms';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ThemeProvider } from '@/src/components/ui/ThemeProvider';
import { Provider } from '@/types/core';
import { DropdownElement } from '@/src/components/ui/Dropdown';

import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import { fetchAvailableModelsV2 } from '@/hooks/useModels';
import { scanForOllamaInstances } from '@/src/components/providers/providers';
import { toastService } from '@/services/toastService';
import { Dropdown } from '@/src/components/ui/Dropdown';



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


      if(!models.length && !providers.length) {
        let ollamaEndpoints = await scanForOllamaInstances();
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
            title: 'Couldn\'t find any providers',
            description: 'Tried to scan, but found no providers'
          });
        }
      }
      
    };
    fetchModels();
  }, []);

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



  if(!providers.length) return <Text className="text-gray-500">No providers configured</Text>;
  
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

  // modelList = [...modelList, ...(modelList.map(x=>({...x, id: "wuut"})))];


  return (
    <View className={className}>
      <Dropdown selected={dropdownModel} onSelect={onModelSelect} children={modelList} />
    </View>
  );
}; 
