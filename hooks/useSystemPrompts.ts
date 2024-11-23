import { useSignal, Signal, signal } from '@preact/signals-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { Character } from '@/types/core';
export const allPrompts = signal<Character[]>([]);
export const customPrompts = signal<Character[]>([]);
let loadedCustomPrompts = false;

export const loadAllPrompts = async () => {
    await loadCustomPrompts();
    allPrompts.value = [...PREDEFINED_PROMPTS, ...customPrompts.value];
}

export const loadCustomPrompts = async () => {
    try {
        if(loadedCustomPrompts) {
            return;
        }
        const stored = await AsyncStorage.getItem('customPrompts');
        loadedCustomPrompts = true;
        if (stored) {
            customPrompts.value = JSON.parse(stored);
        }
    } catch (error) {
      console.error('Error loading custom prompts:', error);
    }
};
