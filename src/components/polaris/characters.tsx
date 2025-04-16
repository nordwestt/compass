import { View, Text } from "react-native";
import { useState } from "react";
import { Character } from "@/src/types/core";
import CharactersList from "@/src/components/character/CharactersList";
import EditCharacter from "@/src/components/character/EditCharacter";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  availableModelsAtom,
  polarisCharactersAtom,
  polarisModelsAtom,
} from "@/src/hooks/atoms";
import { useAtom } from "jotai";
import CharacterService from "@/src/services/character/CharacterService";
import { toastService } from "@/src/services/toastService";
import LogService from "@/utils/LogService";
import PolarisServer from "@/src/services/polaris/PolarisServer";

interface AdminCharactersPanelProps {}

export default function AdminCharactersPanel({}: AdminCharactersPanelProps) {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [availableModels] = useAtom(polarisModelsAtom);
  const [characters, setCharacters] = useAtom(polarisCharactersAtom);

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
  };

  const handleAdd = () => {
    setEditingCharacter({
      id: "",
      name: "",
      content: "",
      icon: "person",
      exposeAsModel: true,
    });
  };

  const handleSave = async (character: Character) => {
    if (character.isServerResource) {
      // Update existing server character
      await PolarisServer.updateCharacter(character);
    } else {
      // Create new server character
      await PolarisServer.createCharacter(character);
    }

    // pull the latest characters from the server
    const updatedCharacters = await PolarisServer.getCharacters();
    setCharacters(updatedCharacters);

    setEditingCharacter(null);
  };

  const handleDelete = async (character: Character) => {
    try {
      await PolarisServer.deleteCharacter(character.id);
      // pull the latest characters from the server
      const updatedCharacters = await PolarisServer.getCharacters();
      setCharacters(updatedCharacters);
    } catch (error: any) {
      LogService.log(
        error,
        { component: "charactersAtom", function: "setter" },
        "error",
      );
      toastService.danger({
        title: "Error",
        description: `Failed to delete character: ${character.name}`,
      });
    }
    setEditingCharacter(null);
  };

  return (
    <View className={`flex-1 bg-background flex-row`}>
      <CharactersList
        characters={characters}
        onCharacterPress={handleEdit}
        onAddCharacter={handleAdd}
        title="Characters"
        className="flex-1 p-4"
      />

      {editingCharacter && (
        <View className="flex-1 m-4 relative">
          <EditCharacter
            existingCharacter={editingCharacter}
            onSave={handleSave}
            onDelete={handleDelete}
            className="flex-1 bg-surface rounded-xl shadow-lg"
            availableModels={availableModels}
            showCharacterExposeAsModel={true}
          />
          <TouchableOpacity
            onPress={() => setEditingCharacter(null)}
            className="absolute top-2 right-2 bg-surface/80 dark:bg-surface/60 p-2 rounded-full z-10"
          >
            <Ionicons name="close" size={24} className="text-text" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
