import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { allPromptsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { rawThemes } from '@/constants/themes';
import { useThemePreset } from './ThemeProvider';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

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
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 rounded-lg bg-background border border-border"
      >
        {selectedPrompt.image && (
          <Image 
            source={selectedPrompt.image} 
            className="!h-[32px] !w-[32px] rounded-full"
          />
        )}
        <Text className="ml-2 text-black dark:text-white">
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
          <View className="rounded-t-xl max-h-[70%]" style={{ backgroundColor: theme.background }}>
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
                    onLongPress={() => {setIsModalVisible(false); router.push(`/edit-character?id=${prompt.id}`)}}
                    className="w-[48%] mb-4 rounded-lg bg-white"
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