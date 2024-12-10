import { MentionedCharacter } from "@/components/ChatInput";
import { Character, Thread } from "@/types/core";

import { ChatMessage } from "@/types/core";

import { Model } from "@/types/core";

export interface ChatProvider {
  sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): AsyncGenerator<string>;
  sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string>;
  sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any>;
}

export interface MessageStreamHandler {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface ChatContextManager {
  prepareContext(message: string, currentThread: Thread, mentionedCharacters: MentionedCharacter[]): {
    messagesToSend: ChatMessage[];
    assistantPlaceholder: ChatMessage;
    characterToUse: Character;
  };
} 