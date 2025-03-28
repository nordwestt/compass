import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom, useSetAtom } from 'jotai';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customPromptsAtom, saveCustomPrompts, availableModelsAtom } from '@/src/hooks/atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, ModelPreference } from '@/src/types/core';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { PREDEFINED_PROMPTS } from '@/constants/characters';
import { ImagePickerButton } from '@/src/components/image/ImagePickerButton';
import { toastService } from '@/src/services/toastService';
import { IconSelector } from '@/src/components/character/IconSelector';
import { DocumentSelector } from './DocumentSelector';
import { ModelPreferenceSelector } from './ModelPreferenceSelector';


interface EditCharacterProps {  
  id: string | undefined;
  onSave: () => void;
  className?: string;
}

export default function EditCharacter({ id, onSave, className }: EditCharacterProps) {
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);
  const [character, setCharacter] = useState<Character | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [useIcon, setUseIcon] = useState(false);
  const [availableModels] = useAtom(availableModelsAtom);
  const dispatchCharacters = useSetAtom(saveCustomPrompts);

  useEffect(() => {
    let chara = id 
      ? customPrompts.find(p => p.id === id) 
      : { name: '', content: '', icon: 'person', modelPreferences: [] };

    setCharacter(chara as Character);
    setUseIcon(!!chara?.icon);
  }, [id]);

  
  const handleDocumentToggle = (docId: string) => {
    if (character?.documentIds?.includes(docId)) {
      // Remove the document if it's already selected
      setCharacter({
        ...character!,
        documentIds: character.documentIds.filter(id => id !== docId)
      });
    } else {
      // Add the document if it's not already selected
      setCharacter({
        ...character!,
        documentIds: [...(character?.documentIds || []), docId]
      });
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setCharacter({ ...character!, image: imageUri });
  };

  const handleModelPreferenceAdd = (modelId: string, level: 'preferred' | 'required') => {
    const newPreference: ModelPreference = { modelId, level };
    const currentPreferences = character?.modelPreferences || [];
    
    // Check if this model already has a preference
    const existingIndex = currentPreferences.findIndex(p => p.modelId === modelId);
    
    if (existingIndex >= 0) {
      // Update existing preference
      const updatedPreferences = [...currentPreferences];
      updatedPreferences[existingIndex] = newPreference;
      setCharacter({ ...character!, modelPreferences: updatedPreferences });
    } else {
      // Add new preference
      setCharacter({ 
        ...character!, 
        modelPreferences: [...currentPreferences, newPreference] 
      });
    }
  };

  const handleModelPreferenceRemove = (modelId: string) => {
    if (!character?.modelPreferences) return;
    
    setCharacter({
      ...character,
      modelPreferences: character.modelPreferences.filter(p => p.modelId !== modelId)
    });
  };

  const saveCharacter = async () => {
    if (!character?.name.trim()) return;

    try {
      let updatedPrompts: Character[];
      if (id) {
        // Edit existing character
        updatedPrompts = customPrompts.map(p =>
          p.id === id ? { 
            ...p, 
            name: character?.name || '', 
            content: character?.content || '',
            image: useIcon ? undefined : (character?.image || p.image),
            icon: useIcon ? character?.icon : undefined,
            documentIds: character?.documentIds || [],
            modelPreferences: character?.modelPreferences || []
          } : p
        );
      } else {
        // Create new character
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: character?.name || '',
          content: character?.content || '',
          image: useIcon ? undefined : (character?.image || require('@/assets/characters/default.png')),
          icon: useIcon ? character?.icon : undefined,
          documentIds: character?.documentIds || [],
          modelPreferences: character?.modelPreferences || []
        };
        updatedPrompts = [...customPrompts, newCharacter];
      }
      console.log('updatedPrompts', updatedPrompts, character?.documentIds);
      await dispatchCharacters(updatedPrompts);
      onSave();
      toastService.success({ title: 'Character saved', description: 'Character saved successfully' });
    } catch (error) {
      console.error('Error saving character:', error);
      toastService.danger({ title: 'Error saving character', description: 'Error saving character' });
    }
  };

  const deleteCharacter = async () => {
    const updatedPrompts = customPrompts.filter(p => p.id !== id);
    await setCustomPrompts(updatedPrompts);
    toastService.success({ title: 'Character deleted', description: 'Character deleted successfully' });
    onSave();
  };

  return (
    <View className={`flex-1 bg-background ${className}`}>
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="items-center mb-8">
          <View className="relative">
            {useIcon ? (
              <TouchableOpacity 
                onPress={() => setShowIconSelector(true)}
                className="w-[80px] h-[80px] rounded-full bg-primary items-center justify-center hover:opacity-80"
              >
                <Ionicons 
                  name={character?.icon || 'person' as any} 
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
            {useIcon ? 'Tap to change icon' : 'Tap to change avatar'}
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
              value={character?.name || ''}
              onChangeText={(text) => setCharacter({ ...character!, name: text })}
              placeholder="Enter character name"
              className="p-4 rounded-lg text-text border-2 border-border bg-surface"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className='flex-1'>
            <Text className="text-base font-medium mb-2 text-text">
              Character Prompt
            </Text>
            <TextInput
              value={character?.content || ''}
              onChangeText={(text) => setCharacter({ ...character!, content: text })}
              placeholder="Enter character prompt"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-surface p-4 rounded-lg text-text border-2 border-border flex-1"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <ModelPreferenceSelector
            availableModels={availableModels}
            selectedPreferences={character?.modelPreferences || []}
            onAddPreference={handleModelPreferenceAdd}
            onRemovePreference={handleModelPreferenceRemove}
          />
          
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
          <Ionicons name="trash-outline" size={20} className="mr-2 !text-red-500 dark:!text-red-300" />
          <Text className="!text-red-500 dark:!text-red-300 font-medium">
            Delete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={saveCharacter}
          className="bg-primary p-4 rounded-lg flex-row items-center justify-center flex-1 hover:opacity-80"
        >
          <Ionicons name="save-outline" size={20} color="white" className="mr-2" />
          <Text className="text-white font-medium text-base">
            {id ? 'Save Changes' : 'Create Character'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 