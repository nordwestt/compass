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
    logo: PROVIDER_LOGOS.anthropic,
    keyRequired: true,
    signupUrl: 'https://console.anthropic.com/signup'
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
    logo: PROVIDER_LOGOS.openai,
    keyRequired: true,
    signupUrl: 'https://platform.openai.com/signup'
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
    logo: PROVIDER_LOGOS.ollama,
    keyRequired: false,
    signupUrl: 'https://ollama.ai'
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
    logo: PROVIDER_LOGOS.elevenlabs,
    keyRequired: true,
    signupUrl: 'https://elevenlabs.io/sign-up'
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
    logo: PROVIDER_LOGOS.searxng,
    keyRequired: false,
    signupUrl: 'https://docs.searxng.org/admin/installation.html'
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
    logo: PROVIDER_LOGOS.replicate,
    keyRequired: true,
    signupUrl: 'https://replicate.com/signin'
  } as Provider
} as const; 