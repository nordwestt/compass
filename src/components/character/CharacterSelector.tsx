import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { allPromptsAtom, customPromptsAtom } from '@/src/hooks/atoms';
import { Character } from '@/src/types/core';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { rawThemes } from '@/constants/themes';
import { ThemeProvider, useThemePreset } from '../ui/ThemeProvider';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';
import { CharacterAvatar } from './CharacterAvatar';
import { Modal } from '../ui/Modal';

interface CharacterSelectorProps {
  selectedPrompt: Character;
  onSelectPrompt: (prompt: Character) => void;
  className?: string;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedPrompt,
  onSelectPrompt,
  className
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allPrompts, setAllPrompts] = useAtom(customPromptsAtom);
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  useEffect(() => {
    if(allPrompts.length === 0) {
      setAllPrompts(PREDEFINED_PROMPTS);
    }
  }, []);

  return (
    <View className={className}>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 h-12 rounded-lg bg-background border border-border hover:bg-surface"
      >
        <CharacterAvatar character={selectedPrompt} size={32} />
        <Text className="ml-2 text-black dark:text-white">
          {selectedPrompt.name}
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
          
          <View className="flex-1 justify-end">
              <View className="p-4 border-b border-border">
                <Text className="text-lg font-bold text-center text-black dark:text-white">
                  Select Character
                </Text>
              </View>
              
              <ScrollView className="p-4">
                <View className="flex-row flex-wrap justify-between">
                  {allPrompts.map((prompt, index) => (
                    <TouchableOpacity
                      key={`${prompt.id}-${index}`}
                      onPress={() => {
                        onSelectPrompt(prompt);
                        setIsModalVisible(false);
                      }}
                      onLongPress={() => {setIsModalVisible(false); router.push(`/edit-character?id=${prompt.id}`)}}
                      className="w-[48%] mb-4 rounded-lg bg-surface"
                    >
                      <View className="items-center p-3">
                        <CharacterAvatar character={prompt} size={64} className="mb-2" />
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
                className="p-4 m-2 rounded-lg border-t border-border bg-surface"
              >
                <Text className="text-center text-text">
                  Cancel
                </Text>
              </TouchableOpacity>
          </View>
      </Modal>
    </View>
  );
}; 