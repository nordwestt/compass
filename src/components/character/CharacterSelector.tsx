import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
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
                  className="p-4 border-t border-gray-200 dark:border-gray-700 bg-surface"
                >
                  <Text className="text-center text-text">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Animated.View>
          </View>
        </ThemeProvider>
      </Modal>
    </View>
  );
}; 