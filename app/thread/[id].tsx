import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ChatThread } from '@/components/ChatThread';
import { TouchableOpacity, View } from 'react-native';
import { useAtomValue } from 'jotai';
import { threadsAtom } from '@/hooks/atoms';
import { useEffect, useLayoutEffect } from 'react';
import { router } from 'expo-router';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threads = useAtomValue(threadsAtom);
  const currentThread = threads.find(t => t.id === id);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    // Set the header title based on the current thread
    navigation.setOptions({
      headerTitle: currentThread ? currentThread.title : 'Thread'
    });
  }, [navigation, currentThread]);

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