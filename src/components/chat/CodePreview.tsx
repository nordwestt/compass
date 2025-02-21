import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
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

  return (
    <View className="w-1/3 h-3/4 m-4 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
      <View className="flex-row justify-between items-center p-2 bg-background border-b border-border">
        <Text className="text-text font-bold">Preview</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} className="text-text" />
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' ? (
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
      )}
    </View>
  );
}; 