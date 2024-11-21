import React, { useState, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { Thread } from '@/app/(tabs)';
import { Signal, effect, signal, useSignal } from '@preact/signals-react';
import { Text } from 'react-native';
import { useSignals } from '@preact/signals-react/runtime';

const OLLAMA_URL = "http://localhost:11434" 


export interface ChatMessage {
  content: string;
  isUser: boolean;
}

export interface ChatThreadProps {
    thread: Signal<Thread>;
    threads: Signal<Thread[]>;
}

export const ChatThread: React.FC<ChatThreadProps> = ({thread, threads}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  //const thread = useSignal<Thread>({id: 0, title: "First conversation", messages:[]});

  const handleSend = async (message: string) => {
    const newMessage = { content: message, isUser: true };
    const assistantPlaceholder = { content: "", isUser: false };
    
    
    thread.value = {
        ...thread.value,
        messages: [...thread.value.messages, newMessage, assistantPlaceholder]
    };

    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [{ role: 'user', content: message }],
        }),
      });

      const reader = response.body?.getReader();
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
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {thread.value.messages.map((message:ChatMessage, index:number) => (
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