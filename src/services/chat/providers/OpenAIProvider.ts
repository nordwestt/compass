import { ChatProvider } from '@/src/types/chat';
import { Character } from '@/types/core';
import { ChatMessage } from '@/types/core';
import { Model } from '@/types/core';
import LogService from '@/utils/LogService';
import { Platform } from 'react-native';

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
      let url = `${model.provider.endpoint}/v1/chat/completions`;
      if(Platform.OS =='web') url = "http://localhost:9493/"+url;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.provider.apiKey}`
        },
        signal,
        body: JSON.stringify({
          model: model.id,
          messages: newMessages,
          stream: true
        }),
        reactNative: { textStreaming: true }
      } as any);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          if (!line.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (error: any) {
            LogService.log(error, { component: 'OpenAIProvider', function: 'sendMessage.processChunk' }, 'error');
            throw error;
          }
        }
      }
    } catch (error: any) {
      LogService.log(error, { component: 'OpenAIProvider', function: 'sendMessage' }, 'error');
      throw error;
    }
  }

  async sendSimpleMessage(message: string, model: Model, systemPrompt: string): Promise<string> {
    let url = `${model.provider.endpoint}`;
    if(Platform.OS =='web') url = "http://localhost:9493/"+url;
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
    if(Platform.OS =='web') url = "http://localhost:9493/"+url;
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