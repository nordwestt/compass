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
    character?: Character;
  }

  export interface Model {
    id: string;
    name: string;
    provider: Provider;
  }

  export interface Character {
    id: string;
    name: string;
    content: string;
    image?: any;
    voice?: Voice;
  }

  export interface Voice {
    id: string;
    name: string;
    previewUrl: string;
    description: string;
    provider: Provider;
  }

  export interface Provider {
    id: string;
    name?: string;
    source: 'ollama' | 'openai' | 'anthropic' | 'elevenlabs' | 'custom';
    capabilities?: {
      llm: boolean,
      tts: boolean,
      stt: boolean
    };
    apiKey?: string;
    endpoint: string;
  }