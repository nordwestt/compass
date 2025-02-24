import { Model, Provider } from '@/src/types/core';
import { ChatProvider } from '@/src/types/chat';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GroqProvider } from './providers/GroqProvider';
import { CerebrasProvider } from './providers/CerebrasProvider';
import { MistralProvider } from './providers/MistralProvider';

export class ChatProviderFactory {
  static getProvider(provider: Provider): ChatProvider {
    switch (provider.name) {
      case 'Ollama':
        return new OllamaProvider(provider);
      case 'OpenAI':
        return new OpenAIProvider(provider);
      case 'Anthropic':
        return new AnthropicProvider(provider);
      case 'Groq':
        return new GroqProvider(provider);
      case 'Cerebras':
        return new CerebrasProvider(provider);
      case 'Mistral':
        return new MistralProvider(provider);
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }
} 