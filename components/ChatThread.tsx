import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { Thread } from '@/app/(tabs)';
import { Signal, effect, signal, useSignal } from '@preact/signals-react';
import { Text } from 'react-native';
import { useSignals } from '@preact/signals-react/runtime';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OLLAMA_URL = "http://localhost:11434" 


export interface ChatMessage {
  content: string;
  isUser: boolean;
}

export interface ChatThreadProps {
    thread: Signal<Thread>;
    threads: Signal<Thread[]>;
}

interface Model {
  id: string;
  name: string;
  provider: string;
}

export const ChatThread: React.FC<ChatThreadProps> = ({thread, threads}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const availableModels = useSignal<Model[]>([]);
  const selectedModel = useSignal<string>('');
  const isLoadingModels = useSignal(false);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    isLoadingModels.value = true;
    try {
      // Get configured API endpoints from storage
      const stored = await AsyncStorage.getItem('apiEndpoints');
      if (!stored) return;
      
      const endpoints = JSON.parse(stored);
      console.log(endpoints);
      const models: Model[] = [];

      for (const endpoint of endpoints) {
        try {
          switch (endpoint.type) {
            case 'ollama':
              const ollamaResponse = await fetch(`http://localhost:11434/api/tags`);
              const ollamaData = await ollamaResponse.json();
              console.log(ollamaData);
              models.push(...ollamaData.models.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: 'Ollama'
              })));
              break;

            case 'openai':
              const openaiResponse = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${endpoint.apiKey}`
                }
              });
              const openaiData = await openaiResponse.json();
              models.push(...openaiData.data
                .filter((model: any) => model.id.includes('gpt'))
                .map((model: any) => ({
                  id: model.id,
                  name: model.id,
                  provider: 'OpenAI'
                })));
              break;

            case 'anthropic':
              const anthropicResponse = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                  'x-api-key': endpoint.apiKey,
                  'anthropic-version': '2023-06-01'
                }
              });
              const anthropicData = await anthropicResponse.json();
              models.push(...anthropicData.map((model: any) => ({
                id: model.name,
                name: model.name,
                provider: 'Anthropic'
              })));
              break;
          }
        } catch (error) {
          console.error(`Error fetching models for ${endpoint.type}:`, error);
        }
      }

      availableModels.value = models;
      if (models.length > 0 && !selectedModel.value) {
        selectedModel.value = models[0].id;
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      isLoadingModels.value = false;
    }
  };

  const handleSend = async (message: string) => {
    const newMessage = { content: message, isUser: true };
    const assistantPlaceholder = { content: "", isUser: false };
    
    thread.value = {
      ...thread.value,
      messages: [...thread.value.messages, newMessage, assistantPlaceholder]
    };

    try {
      const selectedModelData = availableModels.value.find(m => m.id === selectedModel.value);
      if (!selectedModelData) throw new Error('No model selected');

      const stored = await AsyncStorage.getItem('apiEndpoints');
      if (!stored) throw new Error('No API endpoints configured');
      
      const endpoints = JSON.parse(stored);
      const endpoint = endpoints.find((e: any) => e.type === selectedModelData.provider.toLowerCase());
      if (!endpoint) throw new Error('Endpoint not found');

      let response;
      switch (selectedModelData.provider.toLowerCase()) {
        case 'ollama':
          response = await fetch(`http://localhost:11434/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModelData.id,
              messages: [{ role: 'user', content: message }],
            }),
          });
          break;

        case 'openai':
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${endpoint.apiKey}`
            },
            body: JSON.stringify({
              model: selectedModelData.id,
              messages: [{ role: 'user', content: message }],
              stream: true
            }),
          });
          // ... implement OpenAI streaming ...
          break;

        case 'anthropic':
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': endpoint.apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: selectedModelData.id,
              messages: [{ role: 'user', content: message }],
              stream: true
            }),
          });
          // ... implement Anthropic streaming ...
          break;
      }

      const reader = response?.body?.getReader();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            threads.value = threads.value.map((t:any)=>{
              if (t.id === thread.value.id) {
                return thread.value;
              }
              return t;
            });
            break;
          }

          // Convert the chunk to text
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const parsedChunk = JSON.parse(line);
              if (parsedChunk.message?.content) {
                assistantMessage += parsedChunk.message.content;
                // Update the thread's messages in real-time
                const updatedMessages = [...thread.value.messages];
                const lastMessage = updatedMessages.findLast(msg => !msg.isUser);
                if (lastMessage) {
                    lastMessage.content = assistantMessage;
                }
                thread.value = {
                    ...thread.value,
                    messages: updatedMessages
                };
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View className="flex-1">
      <View className="p-4 border-b border-gray-200">
        {isLoadingModels.value ? (
          <Text className="text-gray-500">Loading models...</Text>
        ) : (
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={selectedModel.value}
              onValueChange={(value) => selectedModel.value = value}
              className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200"
            >
              {availableModels.value.map((model) => (
                <Picker.Item 
                  key={model.id} 
                  label={`${model.provider} - ${model.name}`} 
                  value={model.id} 
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {thread.value.messages.map((message: ChatMessage, index: number) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
          />
        ))}
      </ScrollView>
      <ChatInput onSend={handleSend} />
    </View>
  );
}; 


