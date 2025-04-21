import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Character } from "@/src/types/core";
import { CharacterAvatar } from "@/src/components/character/CharacterAvatar";
import { useLocalization } from "@/src/hooks/useLocalization";
interface CharactersListProps {
  characters: Character[];
  onCharacterPress?: (character: Character) => void;
  onCharacterLongPress?: (character: Character) => void;
  onAddCharacter?: () => void;
  title?: string;
  showAddButton?: boolean;
  className?: string;
}

export default function CharactersList({
  characters,
  onCharacterPress,
  onCharacterLongPress,
  onAddCharacter,
  title = "Characters",
  showAddButton = true,
  className = "",
}: CharactersListProps) {
  const { t } = useLocalization();

  return (
    <View className={`flex-1 bg-background ${className}`}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center p-4">
          <Ionicons
            name="people"
            size={32}
            className="!text-primary mr-2 pb-2"
          />
          <Text className="text-2xl font-bold text-primary">{t('characters.characters')}</Text>
        </View>
        {showAddButton && onAddCharacter && (
          <TouchableOpacity
            onPress={onAddCharacter}
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center hover:opacity-80"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white ml-2 font-medium">{t('characters.new_character')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView className="flex-1 p-4">
        <View className="md:gap-4 gap-2 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <TouchableOpacity
              onPress={() => onCharacterPress?.(character)}
              onLongPress={() => onCharacterLongPress?.(character)}
              key={character.id}
              className="w-full mb-4"
            >
              <View
                className="h-40 flex-row bg-surface hover:bg-background rounded-xl p-4 border border-gray-200 shadow-lg"
                pointerEvents={Platform.OS === "web" ? "auto" : "none"}
              >
                <View className="flex-col items-center my-2 mx-auto">
                  <CharacterAvatar
                    character={character}
                    size={64}
                    className="my-auto shadow-2xl"
                  />
                  <Text className="font-extrabold text-primary">
                    {character.name}
                  </Text>
                </View>
                {character.content?.length > 0 && (
                  <View className="flex-1 ml-4">
                    <Text
                      numberOfLines={20}
                      className="text-sm text-gray-500 dark:text-gray-400 mt-1 border border-gray-300 rounded-lg p-2 overflow-y-auto"
                    >
                      {character.content}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
