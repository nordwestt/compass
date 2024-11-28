import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { customPromptsAtom } from '@/hooks/atoms';
import { Character } from '@/types/core';
import { modalService } from '@/services/modalService';
import { useRouter } from 'expo-router';

export default function CharactersScreen() {
  const router = useRouter();
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);

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

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-primary">
          Default Characters
        </Text>
        <View className="flex-row flex-wrap justify-between mb-8">
          {PREDEFINED_PROMPTS.map((prompt) => (
            <View key={prompt.id} className="w-[48%] mb-4 bg-surface rounded-lg p-4 shadow-md">
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
            className="bg-primary p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {customPrompts.map((prompt) => (
          <View key={prompt.id} className="bg-background rounded-lg p-4 mb-4 shadow-sm">
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