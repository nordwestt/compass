import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Character } from '@/types/core';

interface CharacterMentionPopupProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  searchText: string;
}

export const CharacterMentionPopup: React.FC<CharacterMentionPopupProps> = ({
  characters,
  onSelect,
  searchText
}) => {
  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (filteredCharacters.length === 0) return null;

  return (
    <View className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-40 w-64">
      <ScrollView>
        {filteredCharacters.map((character) => (
          <TouchableOpacity
            key={character.id}
            onPress={() => onSelect(character)}
            className="p-2 border-b border-gray-200 dark:border-gray-700"
          >
            <Text className="text-gray-800 dark:text-gray-200">
              {character.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}; 