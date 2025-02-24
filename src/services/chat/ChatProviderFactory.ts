import { Model } from '@/src/types/core';
import { ChatProvider } from '@/src/types/chat';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';

export class ChatProviderFactory {
  static getProvider(model: Model): ChatProvider {
    switch (model.provider.source) {
      case 'ollama':
        return new OllamaProvider(model.provider);
      case 'openai':
        return new OpenAIProvider(model.provider);
      case 'anthropic':
        return new AnthropicProvider(model.provider);
      default:
        throw new Error(`Unsupported provider: ${model.provider.source}`);
    }
  }
} 