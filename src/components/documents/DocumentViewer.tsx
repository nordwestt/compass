import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          <Text key={index} className="text-text mb-4 leading-6">
            {chunk}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}; 