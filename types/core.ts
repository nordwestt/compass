export interface Thread {
    id: string;
    title: string;
    messages: ChatMessage[];
    selectedModel: Model;
    character: Character;
  }

  export interface ChatMessage {
    content: string;
    isUser: boolean;
  }

  export interface Model {
    id: string;
    name: string;
    provider: LLMProvider;
  }

  export interface Character {
    id: string;
    name: string;
    content: string;
    image?: any;
  }

  export interface LLMProvider {
    id?: string;
    name?: string;
    type: 'ollama' | 'openai' | 'anthropic' | 'custom';
    apiKey?: string;
    endpoint: string;
  }