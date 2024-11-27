import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { allPromptsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { PREDEFINED_PROMPTS } from '@/constants/characters';

interface CharacterSelectorProps {
  selectedPrompt: Character;
  onSelectPrompt: (prompt: Character) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedPrompt,
  onSelectPrompt
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const allPrompts = useAtomValue(allPromptsAtom);


  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 rounded-lg bg-background border-2 border-gray-200 dark:border-gray-700"
      >
        {selectedPrompt.image && (
          <Image 
            source={selectedPrompt.image} 
            className="!h-[64px] !w-[64px] rounded-full mr-2"
          />
        )}
        <Text className="flex-1 text-black dark:text-white">
          {selectedPrompt.name}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-center text-black dark:text-white">
                Select Character
              </Text>
            </View>
            
            <ScrollView className="p-4">
              <View className="flex-row flex-wrap justify-between">
                {allPrompts.map((prompt) => (
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