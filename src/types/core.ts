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
    isSystem?: boolean;
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
    image?: any | string;
    icon?: string;
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
    source: 'ollama' | 'openai' | 'anthropic' | 'elevenlabs' | 'serper' | 'searxng' | 'custom' | 'replicate';
    capabilities?: {
      llm: boolean,
      tts: boolean,
      stt: boolean,
      search: boolean,
      image?: boolean
    };
    apiKey?: string;
    endpoint: string;
    logo?: any;
    keyRequired?: boolean;
    signupUrl?: string;
  }