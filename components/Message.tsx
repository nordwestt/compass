import React from 'react';
import { View, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from 'nativewind';
import { Character } from '@/types/core';
import { Text } from 'react-native';

interface MessageProps {
  content: string;
  isUser: boolean;
  character?: Character;
}

export const Message: React.FC<MessageProps> = ({ content, isUser, character }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const markdownStyles = {
    body: {
      color: isUser ? '#fff' : (isDark ? '#fff' : '#1f2937'),
    },
    code_block: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 8,
      borderRadius: 8,
    },
    code_inline: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 4,
      borderRadius: 4,
    },
    fence: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 8,
      borderRadius: 8,
    },
  };

  return (
    <View className={`flex flex-row ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {character && !isUser && (
        <View className="mr-2 items-center my-auto">
          <Image 
            source={character.image } 
            className="!w-[32px] !h-[32px] rounded-full"
          />
          <Text className="text-xs mt-1 text-gray-600 dark:text-gray-400 font-bold">
            {character.name}
          </Text>
        </View>
      )}
      <View 
        className={`px-4 py-2 rounded-2xl max-w-[80%] ${
          isUser ? "bg-blue-500 rounded-tr-none" : "bg-gray-200 dark:bg-gray-800 rounded-tl-none"
        }`}
      >
        <Markdown style={markdownStyles}>
          {content}
        </Markdown>
      </View>
    </View>
  );
}; 