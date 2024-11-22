import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Signal } from '@preact/signals-react';

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
}

const PREDEFINED_PROMPTS: SystemPrompt[] = [
  {
    id: 'default',
    name: 'Default Assistant',
    content: 'You are a helpful AI assistant.'
  },
  {
    id: 'pirate',
    name: 'Pirate',
    content: "You are a pirate from the Caribbean. Response with 'arr', 'matey' and other funny pirate things and use pirate speech"
  },
  {
    id: 'chef',
    name: 'Master Chef',
    content: "You are a world-renowned chef with expertise in multiple cuisines. Share your culinary knowledge with passion and detail."
  },
  {
    id: 'detective',
    name: 'Detective',
    content: "You are a sharp-witted detective in the style of Sherlock Holmes. Analyze problems with deductive reasoning and speak in a proper, analytical manner."
  }
];

interface SystemPromptSelectorProps {
  selectedPrompt: Signal<SystemPrompt>;
  onSelectPrompt: (prompt: SystemPrompt) => void;
}

export const SystemPromptSelector: React.FC<SystemPromptSelectorProps> = ({
  selectedPrompt,
  onSelectPrompt
}) => {
  return (
    <Picker
    selectedValue={selectedPrompt.value.id}
    onValueChange={(value) => {
        const prompt = PREDEFINED_PROMPTS.find(p => p.id === value);
        if (prompt) onSelectPrompt(prompt);
    }}
    className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200"
    >
    {PREDEFINED_PROMPTS.map((prompt) => (
        <Picker.Item 
        key={prompt.id}
        label={prompt.name}
        value={prompt.id}
        />
    ))}
    </Picker>
  );
}; 