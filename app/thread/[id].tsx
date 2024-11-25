import { useLocalSearchParams } from 'expo-router';
import { ChatThread } from '@/components/ChatThread';
import { TouchableOpacity, View } from 'react-native';
import { useAtomValue } from 'jotai';
import { threadsAtom } from '@/hooks/atoms';
import { useEffect } from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threads = useAtomValue(threadsAtom);
  const currentThread = threads.find(t => t.id === id);
  
  useEffect(() => {
    if (!currentThread) {
      router.replace('/');
    }
  }, [id, currentThread]);

  return (
    <View className="flex-1">
      <ChatThread />
    </View>
  );
} 

ThreadScreen.options = {
  headerLeft: () => (
    <TouchableOpacity 
      onPress={() => router.back()}
      className="ml-2"
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
  ),
};