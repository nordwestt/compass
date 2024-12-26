import { atom } from 'jotai'
import { atomWithAsyncStorage } from './storage'
import { Model, Thread, ChatMessage, Character, Provider, Voice } from '@/types/core'
import { PREDEFINED_PROMPTS } from '@/constants/characters'

export const createDefaultThread = (name: string="New thread"): Thread => {
  return {
    id: Date.now().toString(),
    title: name,
    messages: [],
    selectedModel: {
    id: '',
    name: '',
    provider: {
        id: '',
        source: 'ollama',
        endpoint: '',
        apiKey: ''
      }
    },
    character: PREDEFINED_PROMPTS[0]
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
        set(threadsAtom, updatedThreads)
        if((await get(currentThreadAtom)).id === action.payload.id) {
          set(currentThreadAtom, action.payload)
        }
        break
      
      case 'delete':
        const newThreads = threads.filter(t => t.id !== action.payload)
        set(threadsAtom, newThreads)
        
        if((await get(currentThreadAtom)).id === action.payload) {
          if(newThreads.length > 0) {
            set(currentThreadAtom, newThreads[newThreads.length - 1])
          } else {
            set(currentThreadAtom, createDefaultThread())
          }
        }
        
        break
        
      case 'setCurrent':
        set(currentThreadAtom, action.payload)
        break

      case 'updateMessages':
        const threadsWithUpdatedMessages = threads.map(t => 
          t.id === action.payload.threadId 
            ? { ...t, messages: action.payload.messages }
            : t
        )
        set(threadsAtom, threadsWithUpdatedMessages)
        if ((await get(currentThreadAtom)).id === action.payload.threadId) {
          set(currentThreadAtom, {
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

// Add these new atoms
export const customPromptsAtom = atomWithAsyncStorage<Character[]>('customPrompts', [])
export const allPromptsAtom = atom(
  async (get) => [...PREDEFINED_PROMPTS, ...(await get(customPromptsAtom))]
)
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
export const availableProvidersAtom = atomWithAsyncStorage<Provider[]>('providers', [])

export const defaultModelAtom = atomWithAsyncStorage<Model>('defaultModel', createDefaultThread().selectedModel);

export const fontPreferencesAtom = atom({
  fontFamily: 'Caveat-Medium',
  fontSize: 18,
  lineHeight: 24,
  letterSpacing: 0.8,
  messageGap: 2,
});

export const ttsEnabledAtom = atomWithAsyncStorage<boolean>('ttsEnabled', false);
export const searchEnabledAtom = atomWithAsyncStorage<boolean>('searchEnabled', false);

// Add with other atoms
export const availableVoicesAtom = atom<Voice[]>([]);

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

// Add this with other atoms
export const generatedImagesAtom = atomWithAsyncStorage<GeneratedImage[]>('generatedImages', []);