import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom, useSetAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { createDefaultThread, customPromptsAtom, threadActionsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { modalService } from '@/services/modalService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function CharactersScreen() {
  const router = useRouter();
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);

  useEffect(()=>{
    if(customPrompts.length === 0){
      setCustomPrompts(PREDEFINED_PROMPTS);
    }
  },[customPrompts])

  const saveCustomPrompts = async (prompts: Character[]) => {
    try {
      await AsyncStorage.setItem('customPrompts', JSON.stringify(prompts));
      setCustomPrompts(prompts);
    } catch (error) {
      console.error('Error saving custom prompts:', error);
    }
  };

  const handleEdit = (prompt: Character) => {
    router.push(`/edit-character?id=${prompt.id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modalService.confirm({
      title: 'Delete Character',
      message: 'Are you sure you want to delete this character?'
    });

    if (confirmed) {
      const updated = customPrompts.filter(p => p.id !== id);
      await saveCustomPrompts(updated);
    }
  };

  const handleAdd = () => {
    router.push('/edit-character');
  };

  const startChat = async (prompt: Character) => {
    
    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread = createDefaultThread();
    newThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
      id: '',
      provider: { source: 'ollama', endpoint: '', apiKey: '' }
    };
    newThread.character = prompt;
    
    dispatchThread({ type: 'add', payload: newThread });

    // wait for 100 ms before pushing to thread to allow propagation
    setTimeout(() => {
      router.push(`/thread/${newThread.id}`);
    }, 100);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-primary">
          Characters
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {customPrompts.map((prompt) => (
            <TouchableOpacity onPress={() => startChat(prompt)} onLongPress={() => handleEdit(prompt)} key={prompt.id} className="w-[48%] mb-4 bg-surface rounded-lg p-4 shadow-md">
              <View className="items-center">
                <Image source={prompt.image} className="!h-[80px] !w-[80px] rounded-full mb-2" />
                <Text className="font-medium text-center text-gray-800 dark:text-gray-200">
                  {prompt.name}
                </Text>
                <Text className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1">
                  {prompt.content.slice(0, 50)}...
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between items-center mb-4">
          
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-primary p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
} 