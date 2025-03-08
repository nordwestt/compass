import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentUploader } from './DocumentUploader';
import { useAtom } from 'jotai';
import { documentsAtom, currentThreadAtom, threadActionsAtom } from '@/src/hooks/atoms';
import { Document } from '@/src/types/core';
import { PDFService } from '@/src/services/PDFService';
import { toastService } from '@/src/services/toastService';
import { createDefaultThread } from '@/src/hooks/atoms';
import { router } from 'expo-router';
import { Platform } from 'react-native';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useAtom(documentsAtom);
  const [isUploading, setIsUploading] = useState(false);
  const [, setCurrentThread] = useAtom(currentThreadAtom);
  const [, dispatchThread] = useAtom(threadActionsAtom);

  const handleDocumentUpload = async (doc: Document) => {
    try {
      // Parse PDF and extract text
      const parsedDoc = await PDFService.parsePDF(doc);
      setDocuments(prev => [...prev, parsedDoc]);
      
      toastService.success({
        title: 'Document processed',
        description: `Successfully processed ${parsedDoc.pages} pages`
      });
    } catch (error) {
      toastService.danger({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to process document'
      });
    }
  };

  const startDocumentChat = async (doc: Document) => {
    try {
      // Create new thread with document context
      const newThread = createDefaultThread(`Chat: ${doc.name}`);
      
      // Add system message with document context
      newThread.messages.push({
        content: `Using document: ${doc.name}`,
        isSystem: true,
        isUser: false
      });

      // Store document reference in thread metadata
      newThread.metadata = {
        documentId: doc.id,
        documentName: doc.name
      };

      await dispatchThread({ type: 'add', payload: newThread });
      await dispatchThread({ type: 'setCurrent', payload: newThread });

      // Navigate to chat
      if (Platform.OS === 'web' && window.innerWidth >= 768) {
        router.replace('/');
      } else {
        router.push(`/thread/${newThread.id}`);
      }
    } catch (error) {
      toastService.danger({
        title: 'Error',
        description: 'Failed to start document chat'
      });
    }
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
        onPress={() => startDocumentChat(doc)}
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