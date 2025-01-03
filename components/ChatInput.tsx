import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { allPromptsAtom } from '@/hooks/atoms';
import { useAtomValue } from 'jotai';
import { CharacterMentionPopup } from './CharacterMentionPopup';
import { Character } from '@/types/core';

interface ChatInputProps {
  onSend: (message: string, mentionedCharacters: MentionedCharacter[]) => void;
  isGenerating?: boolean;
  onInterrupt?: () => void;
}

export interface ChatInputRef {
  focus: () => void;
}

export interface MentionedCharacter {
  character: Character;
  startIndex: number;
  endIndex: number;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ onSend, isGenerating, onInterrupt }, ref) => {
  const [message, setMessage] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionedCharacters, setMentionedCharacters] = useState<MentionedCharacter[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const allCharacters = useAtomValue(allPromptsAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const handleChangeText = (text: string) => {
    setMessage(text);
    const lastAtSymbol = text.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const searchText = text.slice(lastAtSymbol + 1);
      setMentionSearch(searchText);
      setShowMentionPopup(true);
      setSelectedIndex(0);
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    const lastAtSymbol = message.lastIndexOf('@');
    const beforeMention = message.slice(0, lastAtSymbol);
    const afterMention = message.slice(cursorPosition);
    const newMessage = `${beforeMention}@${character.name}${afterMention}`;
    
    setMentionedCharacters([...mentionedCharacters, {
      character,
      startIndex: lastAtSymbol,
      endIndex: lastAtSymbol + character.name.length + 1
    }]);
    
    setMessage(newMessage);
    setShowMentionPopup(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), mentionedCharacters);
      setMessage('');
      setMentionedCharacters([]);
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string, ctrlKey?: boolean } }) => {

    if (nativeEvent.key === 'Enter' && nativeEvent.ctrlKey) {
      handleSend();
      return;
    }

    const filteredCharacters = allCharacters.filter(char => 
      mentionSearch != '' && char.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    if(filteredCharacters.length === 0) {
      return;
    }

    switch (nativeEvent.key) {
      case 'ArrowUp':
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCharacters.length - 1
        );
        break;
      case 'ArrowDown':
        setSelectedIndex(prev => 
          prev < filteredCharacters.length - 1 ? prev + 1 : 0
        );
        break;
      case 'Enter':
        if (filteredCharacters.length > 0) {
          handleSelectCharacter(filteredCharacters[selectedIndex]);
        }
        break;
    }
  };

  return (
    <View className="relative flex-row items-center p-2 bg-surface border-t border-border rounded-t-xl mx-2">
      {showMentionPopup && (
        <CharacterMentionPopup
          characters={allCharacters}
          onSelect={handleSelectCharacter}
          searchText={mentionSearch}
          selectedIndex={selectedIndex}
        />
      )}
      <TextInput
        ref={inputRef}
        className="flex-1 min-h-[60px] px-4 py-2 bg-background rounded-full mr-2 text-text"
        placeholder="Type a message... (Use @ to mention characters)"
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onSelectionChange={(event) => {
          setCursorPosition(event.nativeEvent.selection.start);
        }}
        multiline
        editable={!isGenerating}
      />
      {isGenerating ? (
        <Pressable
          onPress={onInterrupt}
          className="w-10 h-10 rounded-full bg-red-500 items-center justify-center"
        >
          <Ionicons name="stop" size={26} color="white" />
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSend}
          className="w-12 h-12 rounded-full bg-primary dark:bg-blue-600 items-center justify-center"
        >
          <Ionicons name="send" size={26} color="white" />
        </Pressable>
      )}
    </View>
  );
}); 