import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useAtom, useSetAtom } from "jotai";
import {
  charactersAtom,
  saveCustomPrompts,
  availableModelsAtom,
  syncToPolarisAtom,
} from "@/src/hooks/atoms";
import { AllowedModel, Character, Model } from "@/src/types/core";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { ImagePickerButton } from "@/src/components/image/ImagePickerButton";
import { toastService } from "@/src/services/toastService";
import { IconSelector } from "@/src/components/character/IconSelector";
import { DocumentSelector } from "./DocumentSelector";
import { ModelPreferenceSelector } from "./ModelPreferenceSelector";
import { Switch } from "@/src/components/ui/Switch";

interface EditCharacterProps {
  availableModels: Model[];
  existingCharacter: Character;
  onSave: (character: Character) => void;
  onDelete: (character: Character) => void;
  className?: string;
  showCharacterExposeAsModel?: boolean;
}

export default function EditCharacter({
  existingCharacter,
  onSave,
  onDelete,
  className,
  availableModels,
  showCharacterExposeAsModel = false,
}: EditCharacterProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [useIcon, setUseIcon] = useState(false);
  const dispatchCharacters = useSetAtom(saveCustomPrompts);

  useEffect(() => {
    let chara = existingCharacter;

    setCharacter(chara as Character);
    setUseIcon(!!chara?.icon);
  }, [existingCharacter]);

  const handleDocumentToggle = (docId: string) => {
    if (character?.documentIds?.includes(docId)) {
      // Remove the document if it's already selected
      setCharacter({
        ...character!,
        documentIds: character.documentIds.filter((id) => id !== docId),
      });
    } else {
      // Add the document if it's not already selected
      setCharacter({
        ...character!,
        documentIds: [...(character?.documentIds || []), docId],
      });
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setCharacter({ ...character!, image: imageUri });
  };

  const handleAllowedModelAdd = (model: AllowedModel) => {
    const currentAllowedModels = character?.allowedModels || [];

    // Check if this model already has a preference
    const existingIndex = currentAllowedModels.findIndex(
      (p) => p.id === model.id,
    );

    if (existingIndex >= 0) {
      // Update existing preference
      const updatedAllowedModelIds = [...currentAllowedModels];
      updatedAllowedModelIds[existingIndex] = model;
      setCharacter({ ...character!, allowedModels: updatedAllowedModelIds });
    } else {
      // Add new preference
      setCharacter({
        ...character!,
        allowedModels: [...currentAllowedModels, model],
      });
    }
  };

  const handleAllowedModelRemove = (model: AllowedModel) => {
    if (!character?.allowedModels) return;

    setCharacter({
      ...character,
      allowedModels: character.allowedModels.filter((p) => p.id !== model.id),
    });
  };

  const saveCharacter = async () => {
    if (!character?.name.trim()) return;

    try {
      onSave(character);
      toastService.success({
        title: "Character saved",
        description: "Character saved successfully",
      });
    } catch (error) {
      console.error("Error saving character:", error);
      toastService.danger({
        title: "Error saving character",
        description: "Error saving character",
      });
    }
  };

  const deleteCharacter = async () => {
    toastService.success({
      title: "Character deleted",
      description: "Character deleted successfully",
    });
    onDelete(character as Character);
  };

  return (
    <View className={`flex-1 bg-background ${className}`}>
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="items-center mb-8">
          <View className="relative">
            {useIcon ? (
              <TouchableOpacity
                onPress={() => setShowIconSelector(true)}
                className="w-[80px] h-[80px] rounded-full bg-primary items-center justify-center hover:opacity-80"
              >
                <Ionicons
                  name={character?.icon || ("person" as any)}
                  size={48}
                  color="white"
                />
              </TouchableOpacity>
            ) : (
              <ImagePickerButton
                currentImage={character?.image}
                onImageSelected={handleImageSelected}
              />
            )}
          </View>
          <Text className="text-sm text-text mt-2">
            {useIcon ? "Tap to change icon" : "Tap to change avatar"}
          </Text>
        </View>

        <IconSelector
          isVisible={showIconSelector}
          onClose={() => setShowIconSelector(false)}
          onSelect={(iconName) => {
            setCharacter({ ...character!, icon: iconName, image: undefined });
          }}
          currentIcon={character?.icon}
        />

        <View className="space-y-6 flex-1">
          <View>
            <Text className="text-base font-medium mb-2 text-text">
              Character Name
            </Text>
            <TextInput
              value={character?.name || ""}
              onChangeText={(text) =>
                setCharacter({ ...character!, name: text })
              }
              placeholder="Enter character name"
              className="p-4 rounded-lg text-text border-2 border-border bg-surface"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="flex-1">
            <Text className="text-base font-medium mb-2 text-text">
              Character Prompt
            </Text>
            <TextInput
              value={character?.content || ""}
              onChangeText={(text) =>
                setCharacter({ ...character!, content: text })
              }
              placeholder="Enter character prompt"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-surface p-4 rounded-lg text-text border-2 border-border flex-1"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <ModelPreferenceSelector
              availableModels={availableModels}
              selectedPreferences={character?.allowedModels || []}
              onAddPreference={handleAllowedModelAdd}
              onRemovePreference={handleAllowedModelRemove}
            />
            {showCharacterExposeAsModel && (
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium mb-2 text-text">
                  Expose as Model
                </Text>
                <Switch
                  className="mx-auto"
                  value={character?.exposeAsModel ?? false}
                  onValueChange={(value) =>
                    setCharacter({ ...character!, exposeAsModel: value })
                  }
                />
              </View>
            )}
          </View>

          <DocumentSelector
            selectedDocIds={character?.documentIds || []}
            onSelectDoc={handleDocumentToggle}
            onRemoveDoc={handleDocumentToggle}
          />
        </View>
      </ScrollView>

      <View className="p-4 border-t border-border flex-row justify-between">
        <TouchableOpacity
          onPress={() => deleteCharacter()}
          className="bg-red-100 dark:bg-red-900 p-4 rounded-lg flex-row items-center justify-center flex-1 mr-2 hover:opacity-80"
        >
          <Ionicons
            name="trash-outline"
            size={20}
            className="mr-2 !text-red-500 dark:!text-red-300"
          />
          <Text className="!text-red-500 dark:!text-red-300 font-medium">
            Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={saveCharacter}
          className="bg-primary p-4 rounded-lg flex-row items-center justify-center flex-1 hover:opacity-80"
        >
          <Ionicons
            name="save-outline"
            size={20}
            color="white"
            className="mr-2"
          />
          <Text className="text-white font-medium text-base">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
