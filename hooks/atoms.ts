import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Model, Thread, ChatMessage, Character, LLMProvider } from '@/types/core'

const defaultThread: Thread = {
  id: Date.now().toString(),
  title: "First conversation",
  messages: [],
  selectedModel: {
    id: '',
    name: '',
    provider: {
      type: 'ollama',
      endpoint: '',
      apiKey: ''
    }
  },
  character: {
    id: 'default',
    name: 'Default Assistant',
    content: 'You are a helpful AI assistant.',
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
        if (newThreads.length > 0) {
          set(currentThreadAtom, newThreads[0])
        } else {
          set(threadsAtom, [defaultThread])
          set(currentThreadAtom, defaultThread)
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
export const allPromptsAtom = atom<Character[]>([])
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
export const availableEndpointsAtom = atomWithStorage<LLMProvider[]>('apiEndpoints', [])