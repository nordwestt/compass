import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define template variables
export const TEMPLATE_VARIABLES = [
  { id: "current-date", label: "Current Date", template: "${current-date}" },
  { id: "current-time", label: "Current Time", template: "${current-time}" },
  { id: "current-datetime", label: "Date & Time", template: "${current-datetime}" },
//   { id: "user-name", label: "User Name", template: "${user-name}" },
  { id: "day-of-week", label: "Day of Week", template: "${day-of-week}" },
  { id: "month-name", label: "Month Name", template: "${month-name}" },
  { id: "year", label: "Current Year", template: "${year}" },
];

interface TemplateVariableSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectVariable: (template: string) => void;
}

export const TemplateVariableSelector: React.FC<TemplateVariableSelectorProps> = ({
  isVisible,
  onClose,
  onSelectVariable,
}) => {
  return (
    <View className="bg-surface rounded-xl w-[90%] max-w-md p-4">
        <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-text">
            Insert Template Variable
        </Text>
        <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} className="text-text" />
        </TouchableOpacity>
        </View>
        
        <Text className="text-secondary mb-4">
        These variables will be replaced with actual values when the character responds.
        </Text>
        
        <ScrollView className="">
        {TEMPLATE_VARIABLES.map((variable) => (
            <TouchableOpacity
            key={variable.id}
            onPress={() => onSelectVariable(variable.template)}
            className="flex-row items-center justify-between p-3 border-b border-border hover:opacity-70"
            >
            <View>
                <Text className="font-medium text-text">{variable.label}</Text>
                <Text className="text-secondary text-sm">{variable.template}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={20} className="text-primary" />
            </TouchableOpacity>
        ))}
        </ScrollView>
    </View>
  );
}; 