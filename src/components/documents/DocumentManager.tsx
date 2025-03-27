import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentUploader } from './DocumentUploader';
import { useAtom } from 'jotai';
import { documentsAtom, currentThreadAtom, threadActionsAtom, customPromptsAtom } from '@/src/hooks/atoms';
import { Document } from '@/src/types/core';
import { PDFService } from '@/src/services/PDFService';
import { toastService } from '@/src/services/toastService';
import { createDefaultThread } from '@/src/hooks/atoms';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { DocumentViewer } from './DocumentViewer';
import { modalService } from '@/src/services/modalService';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useAtom(documentsAtom);
  const [isUploading, setIsUploading] = useState(false);
  const [, setCurrentThread] = useAtom(currentThreadAtom);
  const [, dispatchThread] = useAtom(threadActionsAtom);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [customPrompts, setCustomPrompts] = useAtom(customPromptsAtom);

  const handleDocumentUpload = async (doc: Document) => {
    try {
      // Parse PDF and extract text
      const parsedDoc = await PDFService.parsePDF(doc);
      setDocuments([...documents, parsedDoc]);
      
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

  const handleDeleteDocument = async (doc: Document) => {
    // Find characters that depend on this document
    const dependentCharacters = customPrompts.filter(
      character => character.documentIds?.includes(doc.id)
    );

    let confirmMessage = `Are you sure you want to delete "${doc.name}"?`;
    
    if (dependentCharacters.length > 0) {
      confirmMessage += `\n\nThis document is used by ${dependentCharacters.length} character(s):\n${
        dependentCharacters.map(c => `- ${c.name}`).join('\n')
      }\n\nThe document reference will be removed from these characters.`;
    }

    const confirmed = await modalService.confirm({
      title: 'Delete Document',
      message: confirmMessage
    });

    if (!confirmed) return;

    try {
      // Update characters that reference this document
      if (dependentCharacters.length > 0) {
        const updatedPrompts = customPrompts.map(character => {
          if (character.documentIds?.includes(doc.id)) {
            return {
              ...character,
              documentIds: character.documentIds.filter(id => id !== doc.id)
            };
          }
          return character;
        });
        
        setCustomPrompts(updatedPrompts);
      }

      // Remove the document
      const updatedDocuments = documents.filter(d => d.id !== doc.id);
      setDocuments(updatedDocuments);

      // If the deleted document is currently selected, clear the selection
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }

      toastService.success({
        title: 'Document deleted',
        description: `Successfully deleted "${doc.name}"`
      });
    } catch (error) {
      toastService.danger({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete document'
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
      <View className="flex-row gap-2">
        <TouchableOpacity 
          className="p-2 bg-surface border border-primary rounded-lg"
          onPress={() => setSelectedDoc(doc)}
        >
          <Ionicons name="eye" size={20} className="!text-primary" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="p-2 bg-primary rounded-lg"
          onPress={() => startDocumentChat(doc)}
        >
          <Ionicons name="chatbubble" size={20} className="!text-white" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="p-2 bg-red-500 rounded-lg"
          onPress={() => handleDeleteDocument(doc)}
        >
          <Ionicons name="trash" size={20} className="!text-white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 flex-row">
      <View className={`${selectedDoc ? 'w-1/2' : 'flex-1'}`}>
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center p-4">
            <Ionicons name="document-text" size={32} className="!text-primary mr-2 pb-2" />
            <Text className="text-2xl font-bold text-primary">
            Documents
            </Text>
          </View>
          {documents.length > 0 && <DocumentUploader 
            onUpload={handleDocumentUpload}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />}
        </View>

        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={doc => doc.id}
          className={documents.length > 0 ? 
            "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-4 gap-2" : 
            "flex-1"}
          contentContainerStyle={{ flex: 1 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mx-auto my-auto">
              <DocumentUploader 
                onUpload={handleDocumentUpload}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
              <Text className="text-gray-500 mt-2">You have no documents. Upload a document to get started.</Text>
            </View>
          }
        />
      </View>

      {selectedDoc && (
        <View className="w-1/2 pl-4">
          <DocumentViewer
            content={selectedDoc.chunks || []}
            pdfUri={selectedDoc.path}
            title={selectedDoc.name}
            onClose={() => setSelectedDoc(null)}
          />
        </View>
      )}
    </View>
  );
}; 