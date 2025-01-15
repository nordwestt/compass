import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/src/types/core';
import { ChatMessage } from '@/src/types/core';
import { Model } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { Platform } from 'react-native';
import { toastService } from '@/src/services/toastService';

function isTauri(){
  return typeof window !== 'undefined' && !!(window as any).__TAURI__;
}

const PROXY_URL = "http://localhost:9493/";


export class OllamaProvider implements ChatProvider {
  async *sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): AsyncGenerator<string> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({ 
        role: message.isUser ? 'user' : message.isSystem ? 'system' : 'assistant', 
        content: message.content 
      }))
    ];

    try{

      
      let url = `${model.provider.endpoint}/api/chat`;
      if(isTauri()) url = PROXY_URL+url;
      const response =  await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          model: model.id,
          messages: newMessages,
          stream: true
        }),
        reactNative: {textStreaming: true}
      } as any);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      let decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;
        let parsedChunk = null;

        let chunks = buffer.split("\n");
        for(let chunk of chunks){
          try{
            parsedChunk = JSON.parse(chunk);
            yield parsedChunk.message?.content || '';
            buffer = '';
          }
          catch(error: any){
            continue;
          }
        }
          
      }
    }
    catch(error:any){
      LogService.log(error, {component: 'OllamaProvider', function: `sendMessage: ${model.provider.endpoint}`}, 'error');
      toastService.danger({title: "Could not send message", description: error.message});
      throw error;
    }
  }


  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let url = `${model.provider.endpoint}/api/chat`;
    if(isTauri()) url = PROXY_URL+url;
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        stream: false
      }),
    });
    let data = await response.json();
    if(!data?.message){
      throw new Error(`Unexpected format: ${data}`);
    }
    return data.message.content;
  }

  
  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any>{
    let url = `${model.provider.endpoint}/api/chat`;
    if(isTauri()) url = PROXY_URL+url;
    let response = await fetch(url, {
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