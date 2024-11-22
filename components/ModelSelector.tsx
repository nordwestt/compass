import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Signal } from '@preact/signals-react';
import { SelectedModel } from '@/hooks/useChat';
import { Thread } from '@/app/(tabs)';

interface Model {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorProps {
  models: Signal<Model[]>;
  selectedModel: Signal<SelectedModel>;
  onSetModel: (model: SelectedModel) => void;
  onSetDefault: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  models, 
  selectedModel,
  onSetModel,
  onSetDefault
}) => {
  if (!models.value?.length) {
    return <Text className="text-gray-500">Loading models...</Text>;
  }

  return (
    <View className="flex-row justify-between">
    <Picker
        selectedValue={selectedModel.value.id}  
        onValueChange={(value) => {
        onSetModel({id: value, provider: selectedModel.value.provider});
        }}
        className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200"
    >
        {models.value.map((model) => (
        <Picker.Item 
            key={model.id} 
            label={`${model.provider} - ${model.name}`} 
            value={model.id} 
        />
        ))}
    </Picker>
      <TouchableOpacity 
        onPress={onSetDefault}
        className="bg-blue-500 py-2 px-4 my-auto rounded-lg self-start"
      >
        <Text className="text-white text-sm font-medium">Set as Default</Text>
      </TouchableOpacity>
    </View>
  );
}; 