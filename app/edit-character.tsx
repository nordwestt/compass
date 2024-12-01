import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customPromptsAtom } from '@/hooks/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '@/types/core';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { PREDEFINED_PROMPTS } from '@/constants/characters';

export default function EditCharacterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);
  
  let character = id 
    ? customPrompts.find(p => p.id === id) 
    : { name: '', content: '', image: require('@/assets/characters/default.png') };

  if(id){
    character = customPrompts.find(p => p.id === id);
    if(!character){
      character = PREDEFINED_PROMPTS.find(p => p.id === id);
    }
  }
  else{
    character = { name: '', content: '', image: require('@/assets/characters/default.png') };
  }

  const [name, setName] = useState(character?.name || '');
  const [content, setContent] = useState(character?.content || '');

  const saveCharacter = async () => {
    if (!name.trim() || !content.trim()) return;

    try {
      let updatedPrompts: Character[];
      if (id) {
        // Edit existing character
        updatedPrompts = customPrompts.map(p =>
          p.id === id ? { ...p, name, content } : p
        );
      } else {
        // Create new character
        const newCharacter: Character = {
          id: Date.now().toString(),
          name,
          content,
          image: require('@/assets/characters/default.png')
        };
        updatedPrompts = [...customPrompts, newCharacter];
      }
      
      await AsyncStorage.setItem('customPrompts', JSON.stringify(updatedPrompts));
      setCustomPrompts(updatedPrompts);
      router.back();
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-8">
          <Image 
            source={character?.image} 
            className="!h-[80px] !w-[80px] rounded-full mb-4"
          />
          <Text className="text-sm text-text">
            Character Avatar
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-base font-medium mb-2 text-text">
              Character Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter character name"
              className="bg-background p-4 rounded-lg text-text border-2 border-border"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-base font-medium mb-2 text-text">
              Character Prompt
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Enter character prompt"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-background p-4 rounded-lg text-text border-2 border-border"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-border">
        <TouchableOpacity
          onPress={saveCharacter}
          className="bg-primary p-4 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
          <Text className="text-white font-medium text-base">
            {id ? 'Save Changes' : 'Create Character'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 