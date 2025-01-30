import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/src/types/core';
import { ChatMessage, Model } from '@/src/types/core';
import LogService from '@/utils/LogService';
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform as PlatformCust } from '@/src/utils/platform';
import { streamResponse } from '@/src/services/chat/streamUtils';

const PROXY_URL = "http://localhost:9493/";

export class OpenAIProvider implements ChatProvider {
  async *sendMessage(messages: ChatMessage[], model: Model, character: Character, signal?: AbortSignal): AsyncGenerator<string> {
    const newMessages = [
      { role: 'system', content: character.content },
      ...messages.map(message => ({
        role: message.isUser ? 'user' : message.isSystem ? 'system' : 'assistant',
        content: message.content
      }))
    ];

    try {
      if (PlatformCust.isMobile) {
        let url = `${model.provider.endpoint}/v1/chat/completions`;
        if (PlatformCust.isTauri) url = PROXY_URL + url;
        yield* streamResponse(url, {
          model: model.id,
          messages: newMessages,
          stream: true
        });
      } else {
        const openai = createOpenAI({
          baseURL: model.provider.endpoint+'/v1',
          apiKey: model.provider.apiKey,
          fetch: expoFetch as unknown as typeof globalThis.fetch
        });

        const { textStream } = streamText({
          model: openai(model.id),
          messages: newMessages as CoreMessage[],
        });

        for await (const textPart of textStream) {
          yield textPart;
        }
      }
    } catch (error: any) {
      LogService.log(error, { component: 'OpenAIProvider', function: 'sendMessage' }, 'error');
      throw error;
    }
  }

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let url = `${model.provider.endpoint}`;
    if(PlatformCust.isMobile) url = PROXY_URL+url;
    const response = await fetch(url+"/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.provider.apiKey}`
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false
      }),
    });

    const data = await response.json();
    console.log("endpoint", model.provider.endpoint);
    if(!data.choices) {
      throw new Error(`Unexpected format: ${data}`);
    }
    return data.choices[0].message.content;
  }

  async sendJSONMessage(message: string, model: Model, systemPrompt: string): Promise<any> {
    let url = `${model.provider.endpoint}`;
    if(PlatformCust.isMobile) url = PROXY_URL+url;
    const response = await fetch(url+"/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.provider.apiKey}`
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      return { query: "", searchRequired: false };
    }
  }
} 