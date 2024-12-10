import { ThreadAction } from '@/hooks/atoms';
import { MessageStreamHandler } from '@/src/types/chat';
import { Thread } from '@/types/core';
import { Readable } from 'stream';
import LogService from '@/utils/LogService';

export class StreamHandlerService {
  constructor(private tts: any) {}

  async handleStream(
    response: Response,
    currentThread: Thread,
    dispatchThread: (action: ThreadAction) => void,
    onComplete?: () => void
  ) {
    try {
    console.log("reached here");
    if (!response) throw new Error('Stream reader not available');
    
    const reader = response.body?.getReader();
    if(!reader) {
      LogService.log(`No reader available ${JSON.stringify(response.body)}`, {component: 'StreamHandlerService', function: `handleStream`}, 'error');

      return;
    }
    

    let assistantMessage = currentThread.messages[currentThread.messages.length - 1].content;
    let chunkCount = 0;
    const isFirstMessage = currentThread.messages.length === 2;
    
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (this.tts.isSupported) {
            await this.tts.streamText("");
          }
          if (isFirstMessage) {
            await this.handleFirstMessage(assistantMessage, currentThread, dispatchThread);
          }
          break;
        }

        const content = await this.processChunk(value);
        if (content) {
          chunkCount++;
          assistantMessage += content;
          await this.updateMessage(
            content, 
            chunkCount, 
            assistantMessage, 
            currentThread, 
            dispatchThread
          );
        }
      }

      reader.releaseLock();
    } 
    catch(error:any){
      LogService.log(error, {component: 'StreamHandlerService', function: `handleStream`}, 'error');
    }
    finally {
      onComplete?.();
    }
  }

  private async handleFirstMessage(
    message: string,
    currentThread: Thread,
    dispatchThread: (action: ThreadAction) => void
  ): Promise<void> {
    const title = await this.generateThreadTitle(message, currentThread);
    dispatchThread({
      type: 'update',
      payload: { ...currentThread, title }
    });
  }

  private async processChunk(value: Uint8Array): Promise<string | null> {
    const chunk = new TextDecoder().decode(value, { stream: true });
    
    const lines = chunk.split('\n');
    
    let content = '';
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      try {
        const parsedChunk = JSON.parse(line);
        content += parsedChunk.message?.content || 
                       parsedChunk.choices?.[0]?.delta?.content || 
                       parsedChunk.delta?.text;
        
      } catch (error:any) {
        LogService.log(error, {component: 'StreamHandlerService', function: `processChunk`}, 'error');
      }
    }
    return content;
  }

  private async updateMessage(
    content: string,
    chunkCount: number,
    assistantMessage: string,
    currentThread: Thread,
    dispatchThread: (action: ThreadAction) => void
  ): Promise<void> {
    // Handle TTS if supported
    if (this.tts.isSupported) {
      if (chunkCount === 1) await this.tts.streamText(" ");
      this.tts.streamText(content);
    }

    // Update the thread with new content
    const updatedMessages = [...currentThread.messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      lastMessage.content = assistantMessage;
      dispatchThread({
        type: 'update',
        payload: {
          ...currentThread,
          messages: updatedMessages
        }
      });
    }
  }

  private async generateThreadTitle(message: string, currentThread: Thread): Promise<string> {
    const prompt = `Based on this first message, generate a concise 3-word title that captures the essence of the conversation. Format: "Word1 Word2 Word3" (no quotes, no periods)
    
Message: ${message}`;

    try {
      const response = await fetch(`${currentThread.selectedModel.provider.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentThread.selectedModel.id,
          messages: [{
            role: 'system',
            content: 'You are a helpful assistant that generates concise 3-word titles. Only respond with the title in the format "Word1 Word2 Word3" without quotes or periods.'
          }, {
            role: 'user',
            content: prompt
          }],
          stream: true
        })
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let title = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const content = await this.processChunk(value);
        if (content) title += content;
      }
      return title.trim();
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat Thread';
    }
  }

  // ... implement private methods for chunk processing and message updating
} 