import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from 'nativewind';
import { Character } from '@/src/types/core';
import { Text } from 'react-native';
import { currentThreadAtom, editingMessageIndexAtom, fontPreferencesAtom } from '@/src/hooks/atoms';
import { useAtomValue } from 'jotai';
import { InteractionManager, Clipboard } from 'react-native';
import { toastService } from '@/src/services/toastService';
import { Ionicons } from '@expo/vector-icons';
import { CharacterAvatar } from '../character/CharacterAvatar';
import { MessageActions } from './MessageActions';

interface MessageProps {
  content: string;
  isUser: boolean;
  character?: Character;
  index: number;
  onEdit?: (index: number) => void;
  onPreviewCode?: () => void;
  hasPreviewableCode?: boolean;
}

export const Message: React.FC<MessageProps> = ({ content, isUser, character, index, onEdit, onPreviewCode, hasPreviewableCode }) => {
  const { colorScheme } = useColorScheme();
  const currentThread = useAtomValue(currentThreadAtom);
  const preferences = useAtomValue(fontPreferencesAtom);
  const editingMessageIndex = useAtomValue(editingMessageIndexAtom);
  const isDark = colorScheme === 'dark';

  const markdownStyles = {
    body: {
      color: isUser ? '#fff' : (isDark ? '#fff' : '#1f2937'),
      fontFamily: preferences.fontFamily,
      fontSize: preferences.fontSize,
      lineHeight: preferences.lineHeight,
      letterSpacing: preferences.letterSpacing
    },
    code_block: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 8,
      borderRadius: 8,
      fontFamily: 'monospace',
    },
    code_inline: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 4,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: isUser ? '#1e40af' : (isDark ? '#374151' : '#f3f4f6'),
      padding: 8,
      borderRadius: 8,
      fontFamily: 'monospace',
    },
  };

  const [displayContent, setDisplayContent] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setDisplayContent(content);
    });
  }, [content]);

  const renderCodeBlock = (node: any) => {
    const handleCopy = () => {
      Clipboard.setString(node.content);
      toastService.success({
        title: 'Copied to clipboard',
        description: ""
      });
    };

    return (
      <View key={node.content} style={markdownStyles.code_block} className="border-border border">
        <View className="flex-row justify-between items-center mb-2">
          {node.sourceInfo && <Text className="text-xs opacity-50">{node.sourceInfo}</Text>}
          <TouchableOpacity 
            onPress={handleCopy}
            className="bg-surface border-border border px-2 py-1 rounded flex-row items-center"
          >
            <Ionicons name="copy" size={16} color={isDark ? "#fff" : "#000"}/>
            <Text className="text-xs ml-1">Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'monospace' }}>{node.content}</Text>
      </View>
    );
  };

  const handleCopyMessage = () => {
    Clipboard.setString(content);
    toastService.success({
      title: 'Message copied to clipboard',
      description: ""
    });
  };

  function parseContent(content: string): Array<{ type: 'text' | 'annotation'; content: string }> {
    const parts: { type: 'text' | 'annotation'; content: string }[] = [];
    const regex = /\*(.*?)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the annotation if any
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add the annotation without asterisks
      parts.push({
        type: 'annotation',
        content: match[1]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text if any
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  }

  return (
    <View className={`flex flex-row ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {!isUser && (
        <View className="mr-2 items-center my-auto">
          <CharacterAvatar 
            character={character || currentThread.character} 
            size={32} 
          />
          <Text className="text-xs mt-1 text-gray-600 dark:text-gray-400 font-bold">
            {character?.name || currentThread.character?.name}
          </Text>
        </View>
      )}
      <View 
        className={`relative px-4 py-2 mb-4 rounded-2xl max-w-[80%] ${
          isUser ? "bg-primary rounded-tr-none" : "bg-surface rounded-tl-none"
        } ${editingMessageIndex === index ? "bg-yellow-500" : ""}`}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        {editingMessageIndex === index && (
          <Text className="text-yellow-400 text-xs mb-1">Editing...</Text>
        )}
        {editingMessageIndex !== index && (
          <View>
            {parseContent(displayContent).map((part, idx) => (
              part.type === 'text' ? (
                <Markdown 
                  key={idx}
                  style={markdownStyles}
                  rules={{
                    fence: renderCodeBlock,
                    code_block: renderCodeBlock,
                  }}
                >
                  {part.content}
                </Markdown>
              ) : (
                <View 
                  key={idx} 
                  className={`bg-opacity-10 ${
                    isUser ? 'bg-blue-200' : 'bg-gray-200'
                  } rounded-lg px-2 py-1 my-1`}
                >
                  <Text 
                    className={`italic opacity-75 ${
                      isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {part.content}
                  </Text>
                </View>
              )
            ))}
          </View>
        )}
        
        {isHovered && (
          <MessageActions
            isUser={isUser}
            hasPreviewableCode={hasPreviewableCode}
            onCopy={handleCopyMessage}
            onPreviewCode={onPreviewCode}
            onEdit={() => onEdit?.(index)}
          />
        )}
      </View>
    </View>
  );
}; 