import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';

interface CodePreviewProps {
  html?: string;
  css?: string;
  javascript?: string;
  onClose: () => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  html = '',
  css = '',
  javascript = '',
  onClose
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const combinedContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          ${javascript}
        </script>
      </body>
    </html>
  `;

  const codeContent = `// HTML
${html}

// CSS
${css}

// JavaScript
${javascript}`;

  return (
    <View className="w-1/3 h-3/4 m-4 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
      <View className="flex-row justify-between items-center p-2 bg-background border-b border-border">
        <View className="flex-row bg-surface rounded-full">
          <TouchableOpacity 
            onPress={() => setShowPreview(true)}
            className={`px-3 py-1 rounded-full ${showPreview ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text className={`${showPreview ? 'text-white' : 'text-text'}`}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowPreview(false)}
            className={`px-3 py-1 rounded-full ${!showPreview ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Text className={`${!showPreview ? 'text-white' : 'text-text'}`}>Code</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} className="text-text" />
        </TouchableOpacity>
      </View>

      {showPreview ? (
        Platform.OS === 'web' ? (
          <iframe
            srcDoc={combinedContent}
            className="flex-1 w-full h-full border-none"
            sandbox="allow-scripts"
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: combinedContent }}
            className="flex-1"
            originWhitelist={['*']}
          />
        )
      ) : (
        <View className="flex-1">
          <ScrollView className="flex-1">
            <Text className="text-text p-2" style={{ fontFamily: 'monospace' }}>
              {codeContent}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}; 