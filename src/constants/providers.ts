import { Provider } from '@/types/core';

export const PREDEFINED_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    source: 'anthropic' as const,
    capabilities: {
      llm: true,
      tts: false,
      stt: false
    }
  } as Provider,
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    source: 'openai' as const,
    capabilities: {
      llm: true,
      tts: true,
      stt: true
    }
  } as Provider,
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/api/chat',
    source: 'ollama' as const,
    capabilities: {
      llm: true,
      tts: false,
      stt: false
    }
  } as Provider,
  elevenlabs: {
    name: 'ElevenLabs',
    endpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    source: 'elevenlabs' as const,
    capabilities: {
      llm: false,
      tts: true,
      stt: false
    }
  } as Provider,
  
} as const; 