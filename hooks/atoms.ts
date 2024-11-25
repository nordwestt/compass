import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Model, Thread, ChatMessage, Character, Provider } from '@/types/core'
import { PREDEFINED_PROMPTS } from '@/constants/characters'

const defaultThread: Thread = {
  id: Date.now().toString(),
  title: "New thread",
  messages: [],
  selectedModel: {
    id: '',
    name: '',
    provider: {
      source: 'ollama',
      endpoint: '',
      apiKey: ''
    }
  },
  character: {
    id: 'default',
    name: 'Robot',
    content: 'Your name is Robot. You are a helpful AI assistant.',
    image: require('@/assets/characters/default.png')
  }
}

// Core atoms
export const threadsAtom = atomWithStorage<Thread[]>('threads', [defaultThread])
export const currentThreadAtom = atom<Thread>(defaultThread)
export const sidebarVisibleAtom = atom(true)

// Derived atoms
export const currentThreadMessagesAtom = atom(
  (get) => get(currentThreadAtom).messages
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
  (get, set, action: ThreadAction) => {
    const threads = get(threadsAtom)
    
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
        set(currentThreadAtom, action.payload)
        break
      
      case 'delete':
        const newThreads = threads.filter(t => t.id !== action.payload)
        set(threadsAtom, newThreads)
        
        if(get(currentThreadAtom).id === action.payload) {
          if(newThreads.length > 0) {
            set(currentThreadAtom, newThreads[newThreads.length - 1])
          } else {
            set(currentThreadAtom, defaultThread)
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
        if (get(currentThreadAtom).id === action.payload.threadId) {
          set(currentThreadAtom, {
            ...get(currentThreadAtom),
            messages: action.payload.messages
          })
        }
        break
    }
  }
)

// For managing generation state
export const isGeneratingAtom = atom(false)

// For managing models
export const availableModelsAtom = atom<Model[]>([])

// Derived atom for the current model
export const currentModelAtom = atom(
  (get) => get(currentThreadAtom).selectedModel
)

// Derived atom for the current character
export const currentCharacterAtom = atom(
  (get) => get(currentThreadAtom).character
)

// Helper atom for chat actions
export const chatActionsAtom = atom(
  null,
  (get, set, action: { type: 'send' | 'interrupt', payload?: any }) => {
    const currentThread = get(currentThreadAtom)
    
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
export const customPromptsAtom = atomWithStorage<Character[]>('customPrompts', [])
export const allPromptsAtom = atom(
  (get) => [...PREDEFINED_PROMPTS, ...get(customPromptsAtom)]
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
export const availableProvidersAtom = atomWithStorage<Provider[]>('providers', [])

export const defaultModelAtom = atomWithStorage<Model>('defaultModel', defaultThread.selectedModel);

export const fontPreferencesAtom = atom({
  fontFamily: 'Caveat-Medium',
  fontSize: 18,
  lineHeight: 24,
  letterSpacing: 0.8,
  messageGap: 2,
});