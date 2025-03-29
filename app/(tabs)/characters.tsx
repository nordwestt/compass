import { View, Text, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { createDefaultThread, currentIndexAtom, charactersAtom, threadActionsAtom, threadsAtom, syncToPolarisAtom, saveCustomPrompts } from '@/src/hooks/atoms';
import { Character } from '@/src/types/core';
import { modalService } from '@/src/services/modalService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import EditCharacter from '@/src/components/character/EditCharacter';
import { CharacterAvatar } from '@/src/components/character/CharacterAvatar';
import CharacterService from '@/src/services/character/CharacterService';
import PolarisServer from '@/src/services/polaris/PolarisServer';

export default function CharactersScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useAtom(charactersAtom);
  const dispatchThread = useSetAtom(threadActionsAtom);
  const threads = useAtomValue(threadsAtom);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [syncToPolaris, setSyncToPolaris] = useAtom(syncToPolarisAtom);

  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);

  useEffect(() => {
    const loadCharacters = async () => {
      if (characters.length === 0 && !syncToPolaris) {
        setCharacters(PREDEFINED_PROMPTS);
      }
    };
    
    loadCharacters();
  }, [characters]);

  const saveCharacters = async (characters: Character[]) => {
    try {
      await saveCharacters(characters);
    } catch (error) {
      console.error('Error saving characters:', error);
    }
  };

  const handleSyncToServer = async (character: Character) => {
    const updatedCharacter = await CharacterService.syncCharacterToServer(character);
    if (updatedCharacter) {
      const updatedCharacters = characters.map(c => 
        c.id === character.id ? updatedCharacter : c
      );
      setCharacters(updatedCharacters);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modalService.confirm({
      title: 'Delete Character',
      message: 'Are you sure you want to delete this character?'
    });

    if (confirmed) {
      const success = await CharacterService.deleteCharacter(id);
      if (success) {
        const updated = characters.filter(p => p.id !== id);
        setCharacters(updated);
      }
    }
  };

  const handleEdit = (prompt: Character) => {
    if (Platform.OS == 'web') {
      if (editingCharacter?.id === prompt.id) {
        setEditingCharacter(null);
      } else {
        setEditingCharacter(prompt);
      }
    } else {
      router.push(`/edit-character?id=${prompt.id}`);
    }
  };

  const handleAdd = () => {
    if(Platform.OS == 'web'){
      setEditingCharacter({
        id: "",
        name: '',
        content: '',
        icon: 'person',
      });
    } else {
      router.push('/edit-character');
    }
  };

  const startChat = async (prompt: Character) => {
    const latestThread = threads[threads.length - 1];
    
    if (latestThread && latestThread.messages.length === 0) {
      const defaultModel = await AsyncStorage.getItem('defaultModel');
      latestThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
        id: '',
        provider: { source: 'ollama', endpoint: '', apiKey: '' }
      };
      latestThread.character = prompt;
      
      await dispatchThread({ type: 'update', payload: latestThread });
      await dispatchThread({ type: 'setCurrent', payload: latestThread });
      if(Platform.OS == 'web'){
        setCurrentIndex(0);
        router.replace("/");
      }
      else{
        router.push(`/thread/${latestThread.id}`);
      }
      return;
    }

    const defaultModel = await AsyncStorage.getItem('defaultModel');
    const newThread = createDefaultThread();
    newThread.selectedModel = defaultModel ? JSON.parse(defaultModel) : {
      id: '',
      provider: { source: 'ollama', endpoint: '', apiKey: '' }
    };
    newThread.character = prompt;
    
    await dispatchThread({ type: 'add', payload: newThread });

    setTimeout(() => {
      if(Platform.OS == 'web'){
        setCurrentIndex(0);
        router.replace("/");
      }
      else{
        router.push(`/thread/${newThread.id}`);
      }
    }, 100);
  };

  return (
    <View className="flex-1 bg-background flex-row">
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center p-4">
          <Ionicons name="people" size={32} className="!text-primary mr-2 pb-2" />
          <Text className="text-2xl font-bold text-primary">
              Characters
          </Text>
        </View>
          <TouchableOpacity
              onPress={handleAdd}
              className="bg-primary px-4 py-2 rounded-lg flex-row items-center hover:opacity-80">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">New Character</Text>
            </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 p-4">
        <View className="md:gap-4 gap-2 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((prompt) => (
            <TouchableOpacity 
              onPress={() => handleEdit(prompt)} 
              onLongPress={() => startChat(prompt)} 
              key={prompt.id} 
              className="w-full mb-4"
            >
              <View 
                className="h-40 flex-row bg-surface hover:bg-background rounded-xl p-4 border border-gray-200 shadow-lg" 
                pointerEvents={Platform.OS === 'web' ? 'auto' : 'none'}
              >
                <View className="flex-col items-center my-2">
                <CharacterAvatar character={prompt} size={64} className="my-auto shadow-2xl" />
                  <Text className="font-extrabold text-primary">
                      {prompt.name}
                  </Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text 
                    numberOfLines={20} 
                    className="text-sm text-gray-500 dark:text-gray-400 mt-1 border border-gray-300 rounded-lg p-2 overflow-y-auto"
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
      {editingCharacter && (
        <View className="flex-1 m-4 relative">
          <EditCharacter 
            id={editingCharacter.id} 
            onSave={() => setEditingCharacter(null)} 
            className="flex-1 bg-surface rounded-xl shadow-lg" 
          />
          <TouchableOpacity 
            onPress={() => setEditingCharacter(null)}
            className="absolute top-2 right-2 bg-surface/80 dark:bg-surface/60 p-2 rounded-full z-10"
          >
            <Ionicons name="close" size={24} className="text-text" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 