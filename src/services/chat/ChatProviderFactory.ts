import { Model } from '@/types/core';
import { ChatProvider } from '@/src/types/chat';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
//import { AnthropicProvider } from './providers/AnthropicProvider';

export class ChatProviderFactory {
  static getProvider(model: Model): ChatProvider {
    switch (model.provider.source) {
      case 'ollama':
        return new OllamaProvider();
      case 'openai':
        return new OpenAIProvider();
      //case 'anthropic':
      //  return new AnthropicProvider();
      default:
        throw new Error(`Unsupported provider: ${model.provider.source}`);
    }
  }
} 