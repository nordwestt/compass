import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/src/types/core';
import { ChatMessage } from '@/src/types/core';
import { Model } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { toastService } from '@/src/services/toastService';
import { CoreMessage, streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { fetch as expoFetch } from 'expo/fetch';


import {Platform as PlatformCust} from '@/src/utils/platform';
import {streamResponse} from '@/src/services/chat/streamUtils';

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
      if(PlatformCust.isMobile){
        let url = `${model.provider.endpoint}/api/chat`;
        if(PlatformCust.isTauri) url = PROXY_URL+url;
        yield* streamResponse(url, {
          model: model.id,
          messages: newMessages,
          stream: true
        });
      }
      else{

        const ollama = createOllama({
          // optional settings, e.g.
          baseURL: model.provider.endpoint+'/api',
          fetch: expoFetch as unknown as typeof globalThis.fetch
        });

        const { textStream } = streamText({
          model: ollama(model.id),
          messages: newMessages as CoreMessage[],
        });

        for await (const textPart of textStream) {
          console.log(textPart);
          yield textPart;
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
    if(PlatformCust.isTauri) url = PROXY_URL+url;
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
    if(PlatformCust.isTauri) url = PROXY_URL+url;
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