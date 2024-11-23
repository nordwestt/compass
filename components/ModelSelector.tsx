import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { Signal } from '@preact/signals-react';
import { loadDefaultModel } from '@/hooks/useModels';
import { Model } from '@/types/core';


// Add provider logos mapping
const PROVIDER_LOGOS = {
  openai: require('../assets/providers/openai.png'),
  anthropic: require('../assets/providers/anthropic.png'),
  ollama: require('../assets/providers/ollama.png'),
  // Add other provider logos as needed
};

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model;
  onSetModel: (model: Model) => void;
  onSetDefault: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  models, 
  selectedModel,
  onSetModel,
  onSetDefault
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!models.length) {
    return <Text className="text-gray-500">Loading models...</Text>;
  }

  // Find the current model details
  const currentModel = models.find(m => m.id === selectedModel.id);

  if(!currentModel) {
    loadDefaultModel().then((model) => {
      if(model) {
        onSetModel(model);
      }
    });
  }

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
      >
        {PROVIDER_LOGOS[selectedModel.provider.type as keyof typeof PROVIDER_LOGOS] && (
          <Image 
            source={PROVIDER_LOGOS[selectedModel.provider.type as keyof typeof PROVIDER_LOGOS]}
            className="!h-[32px] !w-[32px] rounded-full mr-2"
          />
        )}
        <Text className="flex-1 text-black dark:text-white">
          {currentModel ? `${currentModel.provider.type} - ${currentModel.name}` : 'Select Model'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-xl max-h-[70%]">
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
                    setIsModalVisible(false);
                  }}
                  className="flex-row items-center p-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  {PROVIDER_LOGOS[model.provider.type as keyof typeof PROVIDER_LOGOS] && (
                    <Image
                      source={PROVIDER_LOGOS[model.provider.type as keyof typeof PROVIDER_LOGOS]}
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
                    <View className="bg-blue-500 px-2 py-1 rounded">
                      <Text className="text-white text-sm">Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="p-4 border-t border-gray-200 dark:border-gray-700 flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="flex-1 mr-2"
              >
                <Text className="text-center text-blue-500 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onSetDefault();
                  setIsModalVisible(false);
                }}
                className="flex-1 ml-2 bg-blue-500 py-2 px-4 rounded-lg"
              >
                <Text className="text-center text-white font-medium">
                  Set as Default
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}; 