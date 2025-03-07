import React from 'react';
import { TouchableOpacity, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Document } from '@/src/types/core';
import { toastService } from '@/src/services/toastService';
import * as FileSystem from 'expo-file-system';

interface DocumentUploaderProps {
  onUpload: (doc: Document) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  isUploading,
  setIsUploading
}) => {
  const handleUpload = async () => {
    try {
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Basic validation
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toastService.danger({
          title: 'Invalid file type',
          description: 'Please upload a PDF file'
        });
        return;
      }

      // For web, we'll store the file URI directly
      // For native, we need to copy to app's documents directory
      let finalPath = file.uri;
      if (Platform.OS !== 'web') {
        const documentDir = FileSystem.documentDirectory;
        if (!documentDir) throw new Error('No document directory available');
        
        const newPath = `${documentDir}documents/${file.name}`;
        await FileSystem.makeDirectoryAsync(`${documentDir}documents`, { intermediates: true });
        await FileSystem.copyAsync({ from: file.uri, to: newPath });
        finalPath = newPath;
      }

      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        path: finalPath,
        type: 'pdf',
        pages: 0, // We'll update this after parsing
      };

      onUpload(newDoc);
      
      toastService.success({
        title: 'Upload successful',
        description: 'Document uploaded successfully'
      });

    } catch (error) {
      console.error('Upload error:', error);
      toastService.danger({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleUpload}
      disabled={isUploading}
      className={`p-3 rounded-lg flex-row items-center gap-2 ${
        isUploading ? 'opacity-50' : ''
      } bg-primary`}
    >
      <Ionicons 
        name={isUploading ? 'cloud-upload' : 'add'} 
        size={24} 
        className="!text-white" 
      />
    </TouchableOpacity>
  );
}; 