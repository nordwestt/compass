import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSetAtom } from 'jotai';
import { threadActionsAtom } from './atoms';
import { createDefaultThread } from './atoms';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { currentIndexAtom } from './atoms';

export function useKeyboardShortcuts() {
  const dispatchThread = useSetAtom(threadActionsAtom);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = async (event: KeyboardEvent) => {
        console.log(event);
      // Command/Ctrl + N for new chat
      if ((event.metaKey || event.altKey) && event.key === 'n') {
        event.preventDefault();
        const newThread = createDefaultThread();
        await dispatchThread({ type: 'add', payload: newThread });
        setCurrentIndex(0);
        router.replace("/");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatchThread, router]);
} 