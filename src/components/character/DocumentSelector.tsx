import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { documentsAtom } from '@/src/hooks/atoms';

interface DocumentSelectorProps {
  selectedDocIds: string[];
  onSelectDoc: (docId: string) => void;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  selectedDocIds,
  onSelectDoc,
}) => {
  const documents = useAtomValue(documentsAtom);
  

  return (
    <View className="mt-6">
      <Text className="text-base font-medium mb-2 text-text">
        Associated Documents
      </Text>
      <ScrollView className="max-h-40 bg-surface rounded-lg border-2 border-border">
        {documents.map(doc => (
          <TouchableOpacity
            key={doc.id}
            onPress={() => onSelectDoc(doc.id)}
            className="flex-row items-center p-3 border-b border-border"
          >
            <Ionicons
              name={selectedDocIds.includes(doc.id) ? "checkbox" : "square-outline"}
              size={24}
              className="!text-primary mr-2"
            />
            <View className="flex-1">
              <Text className="text-text">{doc.name}</Text>
              <Text className="text-secondary text-sm">{doc.pages} pages</Text>
            </View>
          </TouchableOpacity>
        ))}
        {documents.length === 0 && (
          <Text className="text-secondary p-3">
            No documents available. Upload documents in the Documents section.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}; 