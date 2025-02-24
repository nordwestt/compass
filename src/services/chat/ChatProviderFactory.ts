import { Model, Provider } from '@/src/types/core';
import { ChatProvider } from '@/src/types/chat';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';

export class ChatProviderFactory {
  static getProvider(provider: Provider): ChatProvider {
    switch (provider.source) {
      case 'ollama':
        return new OllamaProvider(provider);
      case 'openai':
        return new OpenAIProvider(provider);
      case 'anthropic':
        return new AnthropicProvider(provider);
      default:
        throw new Error(`Unsupported provider: ${provider.source}`);
    }
  }
} 