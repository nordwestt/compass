import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentUploader } from '@/src/components/documents/DocumentUploader';
import { useAtom } from 'jotai';
import { documentsAtom } from '@/src/hooks/atoms';
import { Document } from '@/src/types/core';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useAtom(documentsAtom);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentUpload = async (doc: Document) => {
    setDocuments(prev => [...prev, doc]);
  };

  const renderDocument = ({ item: doc }: { item: Document }) => (
    <View className="flex-row items-center p-4 bg-surface rounded-lg mb-2">
      <Ionicons name="document-text" size={24} className="!text-primary mr-3" />
      <View className="flex-1">
        <Text className="text-text font-medium">{doc.name}</Text>
        <Text className="text-secondary text-sm">{doc.pages} pages</Text>
      </View>
      <TouchableOpacity 
        className="p-2 bg-primary rounded-lg"
        onPress={() => {/* We'll implement chat later */}}
      >
        <Ionicons name="chatbubble" size={20} className="!text-white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-text">Documents</Text>
        <DocumentUploader 
          onUpload={handleDocumentUpload}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </View>

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={doc => doc.id}
        className="flex-1"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-secondary text-center">
              No documents yet. Upload a PDF to get started.
            </Text>
          </View>
        }
      />
    </View>
  );
}; 