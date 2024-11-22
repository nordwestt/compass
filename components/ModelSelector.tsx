import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Signal } from '@preact/signals-react';
import { SelectedModel } from '@/hooks/useChat';

interface Model {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorProps {
  isLoading: boolean;
  models: Signal<Model[]>;
  selectedModel: Signal<SelectedModel>;
  onSetDefault: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  isLoading, 
  models, 
  selectedModel,
  onSetDefault 
}) => {
  if (isLoading) {
    return <Text className="text-gray-500">Loading models...</Text>;
  }

  return (
    <View className="space-y-2 flex-row justify-between">
      <View className="bg-gray-100 rounded-lg">
        <Picker
          selectedValue={selectedModel.value.id}  
          onValueChange={(value) => selectedModel.value = {id: value, provider: selectedModel.value.provider}}
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
      </View>
      <TouchableOpacity 
        onPress={onSetDefault}
        className="bg-blue-500 py-2 px-4 rounded-lg self-start"
      >
        <Text className="text-white text-sm font-medium">Set as Default</Text>
      </TouchableOpacity>
    </View>
  );
}; 