import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customPromptsAtom } from '@/hooks/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '@/types/core';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { ImagePickerButton } from '@/src/components/image/ImagePickerButton';
import { useEffect } from 'react';
import { toastService } from '@/services/toastService';


interface EditCharacterProps {  
  id: string | undefined;
  onSave: () => void;
  className?: string;
}

export default function EditCharacter({ id, onSave, className }: EditCharacterProps) {
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    let chara = id 
    ? customPrompts.find(p => p.id === id) 
    : { name: '', content: '', image: require('@/assets/characters/default.png') };

    if(id){
        chara = customPrompts.find(p => p.id === id);
        if(!chara){
            chara = PREDEFINED_PROMPTS.find(p => p.id === id);
        }
    }
    else{
        chara = { name: '', content: '', image: require('@/assets/characters/default.png') };
    }

    setCharacter(chara as Character);
  }, [id]);


  const handleImageSelected = (imageUri: string) => {
    setCharacter({ ...character!, image: imageUri });
  };

  const saveCharacter = async () => {
    if (!character?.name.trim() || !character?.content.trim()) return;

    try {
      let updatedPrompts: Character[];
      if (id) {
        // Edit existing character
        updatedPrompts = customPrompts.map(p =>
          p.id === id ? { ...p, name: character?.name || '', content: character?.content || '', image: character?.image || p.image } : p
        );
      } else {
        // Create new character
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: character?.name || '',
          content: character?.content || '',
          image: character?.image || require('@/assets/characters/default.png')
        };
        updatedPrompts = [...customPrompts, newCharacter];
      }
      await AsyncStorage.setItem('customPrompts', JSON.stringify(updatedPrompts));
      setCustomPrompts(updatedPrompts);
      onSave();
      toastService.success({ title: 'Character saved', description: 'Character saved successfully' });
    } catch (error) {
      console.error('Error saving character:', error);
      toastService.danger({ title: 'Error saving character', description: 'Error saving character' });
    }
  };

  const deleteCharacter = async () => {
    const updatedPrompts = customPrompts.filter(p => p.id !== id);
    await AsyncStorage.setItem('customPrompts', JSON.stringify(updatedPrompts));
    setCustomPrompts(updatedPrompts);
    toastService.success({ title: 'Character deleted', description: 'Character deleted successfully' });
    onSave();
  };

  return (
    <View className={`flex-1 bg-background ${className}`}>
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-8">
          <ImagePickerButton
            currentImage={character?.image}
            onImageSelected={handleImageSelected}
          />
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-base font-medium mb-2 text-text">
              Character Name
            </Text>
            <TextInput
              value={character?.name || ''}
              onChangeText={(text) => setCharacter({ ...character!, name: text })}
              placeholder="Enter character name"
              className="p-4 rounded-lg text-text border-2 border-border bg-surface"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-base font-medium mb-2 text-text">
              Character Prompt
            </Text>
            <TextInput
              value={character?.content || ''}
              onChangeText={(text) => setCharacter({ ...character!, content: text })}
              placeholder="Enter character prompt"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-surface p-4 rounded-lg text-text border-2 border-border"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-border flex-row justify-between">
        <TouchableOpacity
          onPress={() => deleteCharacter()}
          className="bg-red-500 p-4 rounded-lg flex-row items-center justify-center flex-1 mr-2"
        >
          <Ionicons name="trash-outline" size={20} color="white" className="mr-2" />
          <Text className="text-white font-medium text-base">
            Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={saveCharacter}
          className="bg-primary p-4 rounded-lg flex-row items-center justify-center flex-1"
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