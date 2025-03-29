import { atom } from 'jotai'
import { atomWithAsyncStorage } from './storage'
import { Model, Thread, ChatMessage, Character, Provider, Voice, Document } from '@/src/types/core'
import { PREDEFINED_PROMPTS } from '@/constants/characters'
import { CharacterService } from '@/src/services/character/CharacterService'
import { ProviderService } from '@/src/services/provider/ProviderService'
import LogService from '@/utils/LogService'
import { toastService } from '@/src/services/toastService'

export const createDefaultThread = (name: string="New thread"): Thread => {
  // Get the first custom prompt if available, otherwise use the first predefined prompt
  const defaultCharacter = 
    (typeof window !== 'undefined' && localStorage.getItem('customPrompts')) 
      ? JSON.parse(localStorage.getItem('customPrompts') || '[]')[0] 
      : PREDEFINED_PROMPTS[0];

  return {
    id: Date.now().toString(),
    title: name,
    messages: [],
    selectedModel: {
    id: '',
    name: '',
    provider: {
        id: '',
        endpoint: '',
        apiKey: '',
        logo: ''
      }
    },
    character: defaultCharacter
  }
}


// Core atoms
export const threadsAtom = atomWithAsyncStorage<Thread[]>('threads', [createDefaultThread()])
export const currentThreadAtom = atomWithAsyncStorage<Thread>('currentThread', createDefaultThread('Your first thread'))
export const sidebarVisibleAtom = atom(true)

// Derived atoms
export const currentThreadMessagesAtom = atom(
  async (get) => (await get(currentThreadAtom)).messages
)

// First, let's define our action types
export type ThreadAction = 
  | { type: 'add'; payload: Thread }
  | { type: 'update'; payload: Thread }
  | { type: 'delete'; payload: string }
  | { type: 'setCurrent'; payload: Thread }
  | { type: 'updateMessages'; payload: { threadId: string; messages: ChatMessage[] } };

// Update the threadActionsAtom with the proper type
export const threadActionsAtom = atom(
  null,
  async (get, set, action: ThreadAction) => {
    const threads = await get(threadsAtom)
    
    switch (action.type) {
      case 'add':
        set(threadsAtom, [...threads, action.payload])
        set(currentThreadAtom, action.payload)
        break
      
      case 'update':
        const updatedThreads = threads.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
        await set(threadsAtom, updatedThreads)
        if((await get(currentThreadAtom)).id === action.payload.id) {
          await set(currentThreadAtom, action.payload)
        }
        break
      
      case 'delete':
        const newThreads = threads.filter(t => t.id !== action.payload)
        set(threadsAtom, newThreads)
        
        if((await get(currentThreadAtom)).id === action.payload) {
          if(newThreads.length > 0) {
            await set(currentThreadAtom, newThreads[newThreads.length - 1])
          } else {
            await set(currentThreadAtom, createDefaultThread())
          }
        }
        
        break
        
      case 'setCurrent':
        await set(currentThreadAtom, action.payload)
        break

      case 'updateMessages':
        const threadsWithUpdatedMessages = threads.map(t => 
          t.id === action.payload.threadId 
            ? { ...t, messages: action.payload.messages }
            : t
        )
        await set(threadsAtom, threadsWithUpdatedMessages)
        if ((await get(currentThreadAtom)).id === action.payload.threadId) {
          await set(currentThreadAtom, {
            ...(await get(currentThreadAtom)),
            messages: action.payload.messages
          })
        }
        break
    }
  }
)

// For managing generation state
export const isGeneratingAtom = atom(false)

export const currentIndexAtom = atom(0)

// For managing models
//export const availableModelsAtom = atomWithAsyncStorage<Model[]>('availableModels', [])
export const availableModelsAtom = atom<Model[]>([])


// Derived atom for the current model
export const currentModelAtom = atom(
  async (get) => (await get(currentThreadAtom)).selectedModel
)

// Derived atom for the current character
export const currentCharacterAtom = atom(
  async (get) => (await get(currentThreadAtom)).character
)

// Helper atom for chat actions
export const chatActionsAtom = atom(
  null,
  async (get, set, action: { type: 'send' | 'interrupt', payload?: any }) => {
    const currentThread = await get(currentThreadAtom)
    
    switch (action.type) {
      case 'send':
        const newMessage = action.payload
        const updatedThread = {
          ...currentThread,
          messages: [...currentThread.messages, newMessage]
        }
        set(threadActionsAtom, { 
          type: 'update', 
          payload: updatedThread 
        })
        break
        
      case 'interrupt':
        // Handle interrupt logic
        break
    }
  }
)

export const userCharactersAtom = atomWithAsyncStorage<Character[]>('userCharacters', []);
export const polarisCharactersAtom = atom<Character[]>([]);

// Update the charactersAtom to be dynamic based on syncToPolaris
export const charactersAtom = atom(
  async (get) => {
    const syncToPolaris = await get(syncToPolarisAtom);
    
    if (syncToPolaris) {
      // Return characters from the service which will handle server fetching
      return await get(polarisCharactersAtom);
    } else {
      // Use the existing atomWithAsyncStorage implementation for local-only mode
      return await get(userCharactersAtom);
    }
  },
  async (get, set, characters: Character[]) => {
    const syncToPolaris = await get(syncToPolarisAtom);
    
    if (syncToPolaris) {
      // Save each character using the service
      for (const character of characters) {
        await CharacterService.saveCharacter(character);
      }
      const updatedCharacters = await CharacterService.getCharacters();
      set(polarisCharactersAtom, updatedCharacters);
    } else {
      // Use the existing atomWithAsyncStorage implementation for local-only mode
      await set(userCharactersAtom, characters);
    }
  }
);

export const userProvidersAtom = atomWithAsyncStorage<Provider[]>('userProviders', [])

// Similarly update the availableProvidersAtom
export const availableProvidersAtom = atom(
  async (get) => {
    const syncToPolaris = await get(syncToPolarisAtom);
    
    if (syncToPolaris) {
      // Return providers from the service which will handle server fetching
      return await ProviderService.getProviders();
    } else {
      // Use the existing atomWithAsyncStorage implementation for local-only mode
      return await get(userProvidersAtom);
    }
  },
  async (get, set, providers: Provider[]) => {
    const syncToPolaris = await get(syncToPolarisAtom);
    
    if (syncToPolaris) {
      // Save each provider using the service
      for (const provider of providers) {
        await ProviderService.saveProvider(provider);
      }
    } else {
      // Use the existing atomWithAsyncStorage implementation for local-only mode
      await set(userProvidersAtom, providers);
    }
  }
);

export const modalStateAtom = atom<{
  isVisible: boolean;
  type: 'confirm' | 'prompt';
  title: string;
  message: string;
  defaultValue?: string;
}>({
  isVisible: false,
  type: 'confirm',
  title: '',
  message: ''
})
export const defaultModelAtom = atomWithAsyncStorage<Model>('defaultModel', createDefaultThread().selectedModel);

export const fontPreferencesAtom = atom({
  fontFamily: 'System',
  fontSize: 18,
  lineHeight: 24,
  letterSpacing: 0.8,
  messageGap: 2,
});

export const ttsEnabledAtom = atomWithAsyncStorage<boolean>('ttsEnabled', false);
export const searchEnabledAtom = atomWithAsyncStorage<boolean>('searchEnabled', false);

// Add with other atoms
export const availableVoicesAtom = atom<Voice[]>([]);
export const editingMessageIndexAtom = atom<number>(-1);

export const defaultVoiceAtom = atomWithAsyncStorage<Voice | null>('defaultVoice', null);

export const logsAtom = atomWithAsyncStorage<LogEntry[]>('logs', []);

export interface LogEntry {component: string, function: string, date: string, message: string, level: 'error' | 'info' | 'warn' | 'debug'};

// Add this interface near other interfaces
export interface GeneratedImage {
  id: string;
  prompt: string;
  imagePath: string;
  createdAt: string;
}

export const generatedImagesAtom = atomWithAsyncStorage<GeneratedImage[]>('generatedImages', []);

export const selectedImageModelAtom = atomWithAsyncStorage<Model | undefined>('selectedImageModel', undefined);

const getDefaultProxyUrl = () => {
  if (typeof window !== 'undefined') {
    // Check if we're running on the GitHub Pages deployment
    if (window.location.hostname === 'nordwestt.com') {
      return 'https://workers-playground-delicate-bread-86d5.thomas-180.workers.dev/';
    }
  }
  // Default for Docker and local development
  return 'http://localhost/proxy/';
};

export const proxyUrlAtom = atomWithAsyncStorage<string>('proxyUrl', getDefaultProxyUrl());

export const previewCodeAtom = atom<{
  html?: string;
  css?: string;
  javascript?: string;
} | null>(null);

// Add this with the other atoms
export const hasSeenOnboardingAtom = atomWithAsyncStorage<boolean>('hasSeenOnboarding', false);

export const documentsAtom = atomWithAsyncStorage<Document[]>('documents', []);

// Update the saveCustomPrompts atom to use the new charactersAtom
export const saveCustomPrompts = atom(
  null,
  async (get, set, characters: Character[]) => {
    try {
      // Set the characters using the updated atom
      await set(charactersAtom, characters);
      
      // Get all threads and update any that use the modified characters
      const threads = await get(threadsAtom);
      const updatedThreads = threads.map(thread => {
        const updatedCharacter = characters.find(p => p.id === thread.character.id);
        
        // If the character was updated, update the thread
        if (updatedCharacter) {
          return { ...thread, character: updatedCharacter };
        }
        
        return thread;
      });

      // Update threads and current thread if needed
      await set(threadsAtom, updatedThreads);
      const currentThread = await get(currentThreadAtom);
      const updatedCurrentCharacter = characters.find(p => p.id === currentThread.character.id);
      if (updatedCurrentCharacter) {
        await set(currentThreadAtom, { ...currentThread, character: updatedCurrentCharacter });
      }
    } catch (error: any) {
      LogService.log(error, { component: 'saveCustomPrompts', function: 'execute' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to save characters'
      });
    }
  }
);

// Add to your atoms
export const isAdminModeAtom = atom<boolean>(false);
export const isServerConnectedAtom = atom<boolean>(false);
export const serverConnectionAtom = atom<{
  url: string;
  token: string;
  userId: string;
} | null>(null);

export const syncToPolarisAtom = atomWithAsyncStorage<boolean>('syncToPolaris', false);