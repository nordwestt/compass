export const PREDEFINED_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    type: 'anthropic' as const,
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    type: 'openai' as const,
  },
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/api/chat',
    type: 'ollama' as const,
  },
} as const; 