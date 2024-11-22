import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string, ctrlKey?: boolean } }) => {
    if (nativeEvent.key === 'Enter' && nativeEvent.ctrlKey) {
      handleSend();
    }
  };

  return (
    <View className="flex-row items-center p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <TextInput
        className="flex-1 min-h-[40px] px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full mr-2 text-gray-800 dark:text-gray-200"
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={setMessage}
        onKeyPress={handleKeyPress}
        multiline
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 items-center justify-center"
      >
        <Ionicons name="send" size={20} color="white" />
      </Pressable>
    </View>
  );
}; 