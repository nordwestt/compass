import { Provider } from '@/src/types/core';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
export const PREDEFINED_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com',
    source: 'anthropic' as const,
    capabilities: {
      llm: true,
      tts: false,
      stt: false
    },
    logo: PROVIDER_LOGOS.anthropic
  } as Provider,
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com',
    source: 'openai' as const,
    capabilities: {
      llm: true,
      tts: false,
      stt: false,
      image: true
    },
    logo: PROVIDER_LOGOS.openai
  } as Provider,
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434',
    source: 'ollama' as const,
    capabilities: {
      llm: true,
      tts: false,
      stt: false
    },
    logo: PROVIDER_LOGOS.ollama
  } as Provider,
  elevenlabs: {
    name: 'ElevenLabs',
    endpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    source: 'elevenlabs' as const,
    capabilities: {
      llm: false,
      tts: true,
      stt: false
    },
    logo: PROVIDER_LOGOS.elevenlabs
  } as Provider,
  searxng: {
    name: 'SearXNG',
    endpoint: 'https://baresearch.org',
    source: 'searxng' as const,
    capabilities: {
      llm: false,
      tts: false,
      stt: false,
      search: true
    },
    logo: PROVIDER_LOGOS.searxng
  } as Provider,
  replicate: {
    name: 'Replicate',
    endpoint: 'https://api.replicate.com',
    source: 'replicate' as const,
    capabilities: {
      llm: false,
      tts: false,
      stt: false,
      image: true
    },
    logo: PROVIDER_LOGOS.replicate
  } as Provider
} as const; 