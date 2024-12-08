import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/types/core';
import { ChatMessage } from '@/types/core';
import { Model } from '@/types/core';
import axios, { AxiosResponse } from 'axios';


export class OllamaProvider implements ChatProvider {
  async sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): Promise<ReadableStream<any>> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({ 
        role: message.isUser ? 'user' : message.isSystem ? 'system' : 'assistant', 
        content: message.content 
      }))
    ];

    let buffer = ''; // Buffer for incomplete chunks

  return new ReadableStream({
    start: async (controller) => {
      try {
        await axios({
          method: 'post',
          url: `${model.provider.endpoint}/api/chat`,
          responseType: 'text',
          headers: { 'Content-Type': 'application/json' },
          signal,
          data: {
            model: model.id,
            messages: newMessages,
            stream: true
          },
          onDownloadProgress: (progressEvent) => {
            const chunk = progressEvent.event.target.response.slice(buffer.length);
            buffer = progressEvent.event.target.response;
            
            try {
              // Split by newlines and handle each complete chunk
              const lines = chunk.split('\n');
              //console.log(chunk);
              
              for (const line of lines) {
                if (!line.trim()) continue;
                
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.message?.content) {
                    controller.enqueue(new TextEncoder().encode(parsed.message.content));
                  }
                } catch (e) {
                  // If we can't parse, it might be an incomplete chunk
                  // It will be handled in the next iteration
                  continue;
                }
              }
            } catch (error) {
              console.error('Error processing chunk:', error);
            }
          }
        });
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  }

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let response = await fetch(`${model.provider.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        stream: false
      }),
    });
    let data = await response.json();
    return data.message.content;
  }

  
  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any>{
    let response = await fetch(`${model.provider.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
          stream: false,
          format: 'json'
        }),
      });
      let data = await response.json();
    
    try{
      return JSON.parse(data.message.content);
    } catch (error) {
      return {query: "", searchRequired: false};
    }
  }

} 