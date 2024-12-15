import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { createDefaultThread, customPromptsAtom, threadActionsAtom, threadsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { modalService } from '@/services/modalService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function CharactersScreen() {
  const router = useRouter();
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const threads = useAtomValue(threadsAtom);


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
    const latestThread = threads[threads.length - 1];
    
    // If the latest thread has no messages, update it instead of creating a new one
    if (latestThread && latestThread.messages.length === 0) {
      const defaultModel = await AsyncStorage.getItem('defaultModel');
      latestThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
        id: '',
        provider: { source: 'ollama', endpoint: '', apiKey: '' }
      };
      latestThread.character = prompt;
      
      await dispatchThread({ type: 'update', payload: latestThread });
      await dispatchThread({ type: 'setCurrent', payload: latestThread });
      router.push(`/thread/${latestThread.id}`);
      return;
    }

    // Otherwise create a new thread as before
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
        <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center p-4">
          <Ionicons name="people" size={32} className="!text-primary mr-2 pb-2" />
          <Text className="text-2xl font-bold text-primary">
              Characters
          </Text>
        </View>
          <TouchableOpacity
              onPress={handleAdd}
              className="bg-primary px-4 py-2 rounded-lg flex-row items-center">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">New Character</Text>
            </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap md:gap-4 gap-2 mb-8">
          {customPrompts.map((prompt) => (
            <TouchableOpacity 
            onPress={() => startChat(prompt)} 
            onLongPress={() => router.push(`/edit-character?id=${prompt.id}`)} 
            key={prompt.id} 
            className="w-full md:w-[calc(33.33%-16px)] lg:w-[calc(25%-16px)] mb-4"
          >
            <View className="flex-row bg-surface rounded-xl p-4 border border-gray-200 shadow-lg">
              <Image 
                source={prompt.image} 
                className="h-16 w-16 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-text">
                  {prompt.name}
                </Text>
                <Text 
                  numberOfLines={2} 
                  className="text-sm text-gray-500 dark:text-gray-400 mt-1 border border-gray-300 rounded-lg p-2"
                >
                  {prompt.content}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
} 