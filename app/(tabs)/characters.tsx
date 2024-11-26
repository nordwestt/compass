import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { customPromptsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { modalService } from '@/services/modalService';

export default function CharactersScreen() {
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);

  const saveCustomPrompts = async (prompts: Character[]) => {
    try {
      await AsyncStorage.setItem('customPrompts', JSON.stringify(prompts));
      setCustomPrompts(prompts);
    } catch (error) {
      console.error('Error saving custom prompts:', error);
    }
  };

  const handleEdit = async (prompt: Character) => {
    const newName = await modalService.prompt({
      title: 'Edit Character',
      message: 'Enter character name:',
      defaultValue: prompt.name
    });

    if (newName) {
      const newContent = await modalService.prompt({
        title: 'Edit Prompt',
        message: 'Enter character prompt:',
        defaultValue: prompt.content
      });

      if (newContent) {
        const updated = customPrompts.map(p => 
          p.id === prompt.id ? { ...p, name: newName, content: newContent } : p
        );
        await saveCustomPrompts(updated);
      }
    }
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

  const handleAdd = async () => {
    const name = await modalService.prompt({
      title: 'New Character',
      message: 'Enter character name:'
    });

    if (name) {
      const content = await modalService.prompt({
        title: 'Character Prompt',
        message: 'Enter character prompt:'
      });

      if (content) {
        const newPrompt: Character = {
          id: Date.now().toString(),
          name,
          content,
          image: require('@/assets/characters/default.png')
        };
        await saveCustomPrompts([...customPrompts, newPrompt]);
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Default Characters
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {PREDEFINED_PROMPTS.map((prompt) => (
            <View key={prompt.id} className="w-[48%] mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <View className="items-center">
                <Image source={prompt.image} className="!h-[80px] !w-[80px] rounded-full mb-2" />
                <Text className="font-medium text-center text-gray-800 dark:text-gray-200">
                  {prompt.name}
                </Text>
                <Text className="text-sm text-center text-gray-500 dark:text-gray-400 mt-1">
                  {prompt.content.slice(0, 50)}...
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Custom Characters
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-blue-500 p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {customPrompts.map((prompt) => (
          <View key={prompt.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Image source={prompt.image} className="!h-[64px] !w-[64px] rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="font-medium text-gray-800 dark:text-gray-200">
                    {prompt.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {prompt.content.slice(0, 50)}...
                  </Text>
                </View>
              </View>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => handleEdit(prompt)}
                  className="p-2"
                >
                  <Ionicons name="pencil" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(prompt.id)}
                  className="p-2"
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 