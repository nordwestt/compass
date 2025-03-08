import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useAtomValue } from 'jotai';
import { fontPreferencesAtom } from '@/src/hooks/atoms';

interface DocumentViewerProps {
  content: string[];
  title: string;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  content,
  title,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const preferences = useAtomValue(fontPreferencesAtom);
  const isDark = colorScheme === 'dark';

  const markdownStyles = {
    body: {
      color: isDark ? '#fff' : '#1f2937',
      fontFamily: preferences.fontFamily,
      fontSize: preferences.fontSize,
      lineHeight: preferences.lineHeight,
      letterSpacing: preferences.letterSpacing
    },
    heading1: {
      fontSize: preferences.fontSize * 1.5,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    heading2: {
      fontSize: preferences.fontSize * 1.3,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
    },
  };

  return (
    <View className="flex-1 bg-background rounded-lg p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-text">{title}</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 hover:bg-surface rounded-full"
        >
          <Ionicons name="close" size={24} className="text-text" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 bg-surface rounded-lg p-4">
        {content.map((chunk, index) => (
          <View key={index} className="mb-4">
            <Markdown style={markdownStyles}>
              {chunk}
            </Markdown>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}; 