import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSetAtom, atom, useAtomValue } from 'jotai';
import { threadActionsAtom } from './atoms';
import { defaultThreadAtom } from './atoms';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { currentIndexAtom } from './atoms';
import { useColorScheme } from 'nativewind';

// Create a new atom for keyboard events
export const keyboardEventAtom = atom<KeyboardEvent | null>(null);

export function useKeyboardShortcuts() {
  const dispatchThread = useSetAtom(threadActionsAtom);
  const setKeyboardEvent = useSetAtom(keyboardEventAtom);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  const { toggleColorScheme } = useColorScheme();
  const defaultThread = useAtomValue(defaultThreadAtom);
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Update the keyboard event atom
      setKeyboardEvent(event);

      // reset after 100 ms
      setTimeout(() => {
        setKeyboardEvent(null);
      }, 100);

      // Command/Ctrl + N for new chat
      if ((event.metaKey || event.altKey) && event.key === 'n') {
        event.preventDefault();
        const newThread = {...defaultThread, id: Date.now().toString()};
        await dispatchThread({ type: 'add', payload: newThread });
        setCurrentIndex(0);
        router.replace("/");
      }

      // Alt + O to toggle dark/light mode
      if (event.altKey && event.key === 'o') {
        event.preventDefault();
        toggleColorScheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatchThread, router, toggleColorScheme]);
} 