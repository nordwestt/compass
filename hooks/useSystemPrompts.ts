import { useSignal, Signal } from '@preact/signals-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SystemPrompt, PREDEFINED_PROMPTS } from '@/components/SystemPromptSelector';
import { useEffect } from 'react';
import { useSignals } from '@preact/signals-react/runtime';

export function useSystemPrompts() {
  useSignals();
  const customPrompts = useSignal<SystemPrompt[]>([]);
  const allPrompts = useSignal<SystemPrompt[]>([]);

  useEffect(() => {
    loadCustomPrompts();
  }, []);

  const loadCustomPrompts = async () => {
    try {
      const stored = await AsyncStorage.getItem('customPrompts');
      if (stored) {
        customPrompts.value = JSON.parse(stored);
        allPrompts.value = [...PREDEFINED_PROMPTS, ...customPrompts.value];
      } else {
        allPrompts.value = PREDEFINED_PROMPTS;
      }
    } catch (error) {
      console.error('Error loading custom prompts:', error);
      allPrompts.value = PREDEFINED_PROMPTS;
    }
  };

  return {
    allPrompts,
    loadCustomPrompts
  };
} 