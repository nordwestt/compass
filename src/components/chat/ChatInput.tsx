import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { charactersAtom, editingMessageIndexAtom, fontPreferencesAtom } from '@/src/hooks/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { CharacterMentionPopup } from '@/src/components/character/CharacterMentionPopup';
import { Character } from '@/src/types/core';

interface ChatInputProps {
  onSend: (message: string, mentionedCharacters: MentionedCharacter[]) => void;
  isGenerating?: boolean;
  onInterrupt?: () => void;
  className?: string;
}

export interface ChatInputRef {
  focus: () => void;
  setEditMessage: (message: string) => void;
}

export interface MentionedCharacter {
  character: Character;
  startIndex: number;
  endIndex: number;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ onSend, isGenerating, onInterrupt, className = '' }, ref) => {
  const [message, setMessage] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionedCharacters, setMentionedCharacters] = useState<MentionedCharacter[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const allCharacters = useAtomValue(charactersAtom);
  const fontPreferences = useAtomValue(fontPreferencesAtom);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useAtom(editingMessageIndexAtom);
  const [inputHeight, setInputHeight] = useState<number>(40); // Initial height
  const lineHeight = fontPreferences.lineHeight || 20; // Default line height if not specified

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    setEditMessage: (message: string) => {
      setMessage(message);
      setIsEditing(true);
      inputRef.current?.focus();
    }
  }));

  const handleChangeText = (text: string) => {
    setMessage(text);

    // get number of lines in text
    const lines = text.split('\n').length;
    if(lines == 1) setInputHeight(lineHeight);
    else setInputHeight(lineHeight * Math.min(lines, 5));

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
      setIsEditing(false);
      setInputHeight(lineHeight);
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string, shiftKey?: boolean } }) => {
    // Only handle Enter for sending on desktop/web platforms
    if (Platform.OS === 'web' && nativeEvent.key === 'Enter') {
      if (!nativeEvent.shiftKey) {
        handleSend();
        return;
      }
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

  const handleBlur = () => {
    setIsEditing(false);
      setMentionedCharacters([]);
    setShowMentionPopup(false);
    setEditingMessageIndex(-1);
  };

  return (
    <View className={`relative flex-row items-center p-2 bg-surface border-t border-border rounded-t-xl mx-2 ${className}`}>
      {showMentionPopup && (
        <CharacterMentionPopup
          characters={allCharacters}
          onSelect={handleSelectCharacter}
          searchText={mentionSearch}
          selectedIndex={selectedIndex}
        />
      )}
      <TextInput
        onBlur={handleBlur}
        ref={inputRef}
        className={`flex-1 pt-1 outline-none px-4 bg-surface rounded-lg mr-2 text-text ${isEditing ? "border-2 border-yellow-500" : ""}`}
        placeholder="Type a message... "
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        onSelectionChange={(event) => {
          setCursorPosition(event.nativeEvent.selection.start);
        }}
        multiline
        textAlignVertical="top"
        editable={!isGenerating}
        style={{
          fontFamily: fontPreferences.fontFamily,
          fontSize: fontPreferences.fontSize,
          lineHeight: fontPreferences.lineHeight,
          letterSpacing: fontPreferences.letterSpacing,
          height: inputHeight,
        }}
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
          className="w-12 h-12 rounded-full bg-primary items-center justify-center"
        >
          <Ionicons name="send" size={26} color="white" />
        </Pressable>
      )}
      {isEditing && (
        <Text className="absolute -top-6 right-14 text-yellow-500 text-sm">
          Editing message...
        </Text>
      )}
    </View>
  );
}); 