import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { allPromptsAtom, availableModelsAtom, charactersAtom } from '@/src/hooks/atoms';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { toastService } from '@/src/services/toastService';

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
  const [allPrompts, setAllPrompts] = useAtom(charactersAtom);
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];
  const availableModels = useAtomValue(availableModelsAtom);

  useEffect(() => {
    if(allPrompts.length === 0) {
      setAllPrompts(PREDEFINED_PROMPTS);
    }
  }, []);

  const isCharacterCompatible = (character: Character): boolean => {
    if (!character.modelPreferences || character.modelPreferences.length === 0) {
      return true; // No preferences means compatible with any model
    }
    
    const requiredPreferences = character.modelPreferences.filter(p => p.level === 'required');
    if (requiredPreferences.length === 0) {
      return true; // Only preferred models, so still compatible
    }
    
    // Check if any required model is available
    return requiredPreferences.some(pref => 
      availableModels.some(model => model.id === pref.modelId)
    );
  };

  return (
    <View className={className}>
      <Pressable 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 h-12 rounded-lg bg-background border border-border hover:bg-surface"
      >
        <CharacterAvatar character={selectedPrompt} size={32} />
        <Text className="ml-2 text-text flex-1">
          {selectedPrompt.name}
        </Text>
      </Pressable>

      <Modal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        maxHeight="85%"
      >
              <View className="p-4 border-b border-border">
                <Text className="text-lg font-bold text-center text-text">
                  Select Character
                </Text>
              </View>
              
              <ScrollView className="p-4">
                <View className="flex-row flex-wrap justify-between">
                  {allPrompts.map((prompt, index) => {
                    const isCompatible = isCharacterCompatible(prompt);
                    return (
                      <TouchableOpacity
                        key={`${prompt.id}-${index}`}
                        onPress={() => {
                          if (isCompatible) {
                            onSelectPrompt(prompt);
                            setIsModalVisible(false);
                          } else {
                            toastService.warning({
                              title: "Incompatible Character",
                              description: "This character requires specific models that aren't available."
                            });
                          }
                        }}
                        onLongPress={() => {setIsModalVisible(false); router.push(`/edit-character?id=${prompt.id}`)}}
                        className={`w-[48%] mb-4 rounded-lg ${isCompatible ? 'bg-surface' : 'bg-surface/50 border-red-300 border'}`}
                      >
                        <View className="items-center p-3">
                          <CharacterAvatar character={prompt} size={64} className="mb-2" />
                          <View className="flex-row items-center">
                            <Text className="font-medium text-center text-black dark:text-white">
                              {prompt.name}
                            </Text>
                            {!isCompatible && (
                              <Ionicons name="alert-circle" size={16} color="red" className="ml-1" />
                            )}
                          </View>
                          <Text className="text-sm text-center text-gray-500 dark:text-gray-400">
                            {prompt.content.slice(0, 30)}...
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
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
      </Modal>
    </View>
  );
}; 