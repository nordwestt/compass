import { MentionedCharacter } from '@/components/ChatInput';
import { ChatContextManager } from '@/src/types/chat';
import { ChatMessage } from '@/types/core';
import { Thread } from '@/types/core';

export class CharacterContextManager implements ChatContextManager {
  prepareContext(message: string, currentThread: Thread, mentionedCharacters: MentionedCharacter[]) {
    const newMessage = { content: message, isUser: true };
    let assistantPlaceholder: ChatMessage = { content: "", isUser: false };
    let messagesToSend: ChatMessage[] = [];

    if (mentionedCharacters.length > 0) {
      const contextMessage = this.buildContextMessage(newMessage, currentThread);
      assistantPlaceholder = { 
        content: '', 
        isUser: false, 
        character: mentionedCharacters[0].character 
      };
      messagesToSend = [
        { content: contextMessage, isUser: true },
        assistantPlaceholder
      ];
    } else {
      messagesToSend = [newMessage, assistantPlaceholder];
    }
    
    let historyToSend: ChatMessage[] = [];
    // any character messages should be merged with the user's last message
    for (let i = 0; i < currentThread.messages.length; i++) {
        const message = currentThread.messages[i];
        if (message.character && historyToSend.length > 0) {
        historyToSend[historyToSend.length - 1].content += `\n\n${[message.character.name]} responded: "${message.content}"`;
        } else {
        historyToSend.push(message);
        }
    }

    return {
      messagesToSend,
      historyToSend,
      assistantPlaceholder,
      useMention: mentionedCharacters.length > 0,
      characterToUse: mentionedCharacters.length > 0 
        ? mentionedCharacters[0].character 
        : currentThread.character
    };
  }

  private buildContextMessage(newMessage: ChatMessage, thread: Thread): string {
    if (thread.messages.length < 2) {
      return `User: "${newMessage.content}"`;
    }

    const userLastMessage = thread.messages[thread.messages.length - 2];
    const assistantLastMessage = thread.messages[thread.messages.length - 1];
    
    return `I told ${thread.character.name} "${userLastMessage.content}" and they responded with "${assistantLastMessage.content}"\n\nUser: "${newMessage.content}"`;
  }
} 