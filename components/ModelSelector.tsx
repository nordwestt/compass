import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, Platform } from 'react-native';
import { Signal } from '@preact/signals-react';
import { Model } from '@/types/core';
import { useAtom, useAtomValue } from 'jotai';
import { availableProvidersAtom, availableModelsAtom, defaultModelAtom } from '@/hooks/atoms';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { ThemeProvider } from './ThemeProvider';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';


interface ModelSelectorProps {
  selectedModel: Model;
  onSetModel: (model: Model) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel,
  onSetModel,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const endpoints = useAtomValue(availableProvidersAtom);
  const models = useAtomValue(availableModelsAtom);
  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);

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
  }, [models, selectedModel.id, defaultModel, onSetModel]);



  if(!endpoints.length) return <Text className="text-gray-500">No providers configured</Text>;
  
  if (!models.length) {
    return <Text className="text-gray-500">Loading models...</Text>;
  }

  // Remove the model selection logic from render phase
  const currentModel = models.find(m => m.id === selectedModel.id);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-2 py-2 rounded-lg bg-background border border-border"
      >
        {PROVIDER_LOGOS[selectedModel.provider.source as keyof typeof PROVIDER_LOGOS] && (
          <Image 
            source={PROVIDER_LOGOS[selectedModel.provider.source as keyof typeof PROVIDER_LOGOS]}
            className="!h-[32px] !w-[32px] rounded-full"
          />
        )}
        {Platform.OS == 'web' && (
          <Text className="ml-2 text-black dark:text-white">
            {currentModel ? `${currentModel.name}` : 'Select Model'}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ThemeProvider>
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="absolute inset-0 bg-black/50"
          />
          <View className="flex-1 justify-end">
            <Animated.View 
              entering={SlideInDown.springify().damping(15)}
              exiting={SlideOutDown.duration(200)}
              className="rounded-t-xl max-h-[70%] bg-background"
            >
              <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-lg font-bold text-center text-black dark:text-white">
                  Select Model
                </Text>
              </View>
              
              <ScrollView className="p-4">
                {models.map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    onPress={() => {
                      onSetModel(model);
                      //setIsModalVisible(false);
                    }}
                    className="flex-row items-center p-3 mb-2 rounded-lg bg-surface"
                  >
                    {PROVIDER_LOGOS[model.provider.source as keyof typeof PROVIDER_LOGOS] && (
                      <Image
                        source={PROVIDER_LOGOS[model.provider.source as keyof typeof PROVIDER_LOGOS]}
                        className="!h-[48px] !w-[48px] rounded-full mr-3"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="font-medium text-black dark:text-white">
                        {model.name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {model.provider.name}
                      </Text>
                    </View>
                    {model.id === selectedModel.id && (
                      <View className="bg-primary px-2 py-1 rounded">
                        <Text className="text-white text-sm">Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="p-4 border-t border-gray-200 dark:border-gray-700 flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 mr-2 bg-surface p-2 rounded-lg">
                  <Text className="text-center text-text">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDefaultModel(selectedModel);
                    setIsModalVisible(false);
                  }}
                  className="flex-1 ml-2 bg-primary p-2 rounded-lg"
                >
                  <Text className="text-center text-white font-medium">
                    Set as Default
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ThemeProvider>
      </Modal>
    </>
  );
}; 