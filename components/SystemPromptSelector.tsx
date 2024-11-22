import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { Signal } from '@preact/signals-react';
import { useSystemPrompts } from '@/hooks/useSystemPrompts';
import { useSignals } from '@preact/signals-react/runtime';

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  image?: any;
}

export const PREDEFINED_PROMPTS: SystemPrompt[] = [
  {
    id: 'default',
    name: 'Default Assistant',
    content: 'You are a helpful AI assistant.',
    image: require('../assets/characters/default.png')
  },
  {
    id: 'pirate',
    name: 'Pirate',
    content: "You are a pirate from the Caribbean. Response with 'arr', 'matey' and other funny pirate things and use pirate speech",
    image: require('../assets/characters/pirate.png')
  },
  {
    id: 'chef',
    name: 'Master Chief',
    content: "You are a Master Chief from Halo. Speak in a military tone and use phrases like 'Aye' and 'Halo' and 'Combat Evolved'.",
    image: require('../assets/characters/master-chief.png')
  },
  {
    id: 'detective',
    name: 'Detective',
    content: "You are a sharp-witted detective in the style of Sherlock Holmes. Analyze problems with deductive reasoning and speak in a proper, analytical manner.",
    image: require('../assets/characters/sherlock-holmes.png')
  },
  {
    id: 'bob-marley',
    name: 'Bob Marley',
    content: "You are Bob Marley. Speak in a reggae tone and use phrases like 'One Love' and 'No Woman No Cry'.",
    image: require('../assets/characters/bob-marley.png')
  }
];

interface SystemPromptSelectorProps {
  selectedPrompt: Signal<SystemPrompt>;
  onSelectPrompt: (prompt: SystemPrompt) => void;
}

export const SystemPromptSelector: React.FC<SystemPromptSelectorProps> = ({
  selectedPrompt,
  onSelectPrompt
}) => {
  useSignals();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { allPrompts } = useSystemPrompts();

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
      >
        {selectedPrompt.value.image && (
          <Image 
            source={selectedPrompt.value.image} 
            className="!h-[64px] !w-[64px] rounded-full mr-2"
          />
        )}
        <Text className="flex-1 text-black dark:text-white">
          {selectedPrompt.value.name}
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
                Select Character
              </Text>
            </View>
            
            <ScrollView className="p-4">
              <View className="flex-row flex-wrap justify-between">
                {allPrompts.value.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    onPress={() => {
                      onSelectPrompt(prompt);
                      setIsModalVisible(false);
                    }}
                    className="w-[48%] mb-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <View className="items-center p-3">
                      {prompt.image && (
                        <Image
                          source={prompt.image}
                          className="!h-[100px] !w-[100px] rounded-full mb-2"
                        />
                      )}
                      <Text className="font-medium text-center text-black dark:text-white">
                        {prompt.name}
                      </Text>
                      <Text className="text-sm text-center text-gray-500 dark:text-gray-400">
                        {prompt.content.slice(0, 30)}...
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-center text-blue-500 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}; 