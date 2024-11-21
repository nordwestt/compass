import React from 'react';
import { View, Text } from 'react-native';

interface MessageProps {
  content: string;
  isUser: boolean;
}

export const Message: React.FC<MessageProps> = ({ content, isUser }) => {
  return (
    <View className={`flex flex-row  ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <View 
        className={`px-4 py-2 rounded-2xl max-w-[80%] ${isUser ? "bg-blue-500 rounded-tr-none" : "bg-gray-200 rounded-tl-none"}`}>
        <Text className={`text-base ${isUser ? "text-white" : "text-gray-800"}`}>
          {content}
        </Text>
      </View>
    </View>
  );
}; 