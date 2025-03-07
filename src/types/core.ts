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
  capabilities?: {
    llm: boolean;
    tts: boolean;
    stt: boolean;
    search: boolean;
    image?: boolean;
    embedding?: boolean;
  };
  apiKey?: string;
  endpoint: string;
  logo: any;
  keyRequired?: boolean;
  signupUrl?: string;
}

export interface Document {
  id: string;
  name: string;
  path: string;
  pages: number;
  type: 'pdf';
  chunks?: string[];
  embeddings?: number[][];
}
