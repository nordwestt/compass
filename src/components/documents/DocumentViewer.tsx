import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useAtomValue } from 'jotai';
import { fontPreferencesAtom } from '@/src/hooks/atoms';
import WebView from 'react-native-webview';

interface DocumentViewerProps {
  content: string[];
  pdfUri: string;
  title: string;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  content,
  pdfUri,
  title,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const preferences = useAtomValue(fontPreferencesAtom);
  const isDark = colorScheme === 'dark';
  const [showPdf, setShowPdf] = useState(true);

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

  const renderPDFViewer = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          src={`${pdfUri}#toolbar=0`}
          className="w-full h-full border-none"
          style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }}
        />
      );
    } else {
      // For native platforms, use WebView to display PDF
      return (
        <WebView
          source={{ uri: pdfUri }}
          style={{ flex: 1 }}
          className="bg-surface rounded-lg"
        />
      );
    }
  };

  return (
    <View className="flex-1 bg-surface rounded-lg p-4 shadow-lg">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-text">{title}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => setShowPdf(!showPdf)}
            className="p-2 hover:bg-surface rounded-full"
          >
            <Ionicons 
              name={showPdf ? "document-text" : "document"} 
              size={24} 
              className="text-text" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onClose}
            className="p-2 hover:bg-surface rounded-full"
          >
            <Ionicons name="close" size={24} className="text-text" />
          </TouchableOpacity>
        </View>
      </View>
      
      {showPdf ? (
        renderPDFViewer()
      ) : (
        <ScrollView className="flex-1 bg-surface rounded-lg p-4">
          {content.map((chunk, index) => (
            <View key={index} className="mb-4">
              <Markdown style={markdownStyles}>
                {chunk}
              </Markdown>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}; 