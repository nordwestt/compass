import { Platform } from 'react-native';
import { Document } from '@/src/types/core';
import * as FileSystem from 'expo-file-system';
import LogService from '@/utils/LogService';
import { chunkText } from '@/src/utils/semanticSearch';

export class PDFService {
  static async parsePDF(doc: Document): Promise<Document> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use fetch to get the file contents
        const response = await fetch(doc.path);
        const blob = await response.blob();
        // We'll implement actual PDF parsing later
        // For now, just return the document with placeholder data
        return {
          ...doc,
          pages: 1,
          chunks: ['Document content will be processed here']
        };
      } else {
        // For native platforms
        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(doc.path);
        if (!fileInfo.exists) {
          throw new Error('File not found');
        }

        // For now, return basic document info
        return {
          ...doc,
          pages: 1,
          chunks: ['Document content will be processed here']
        };
      }
    } catch (error) {
      LogService.log(error as string, {
        component: 'PDFService',
        function: 'parsePDF'
      }, 'error');
      throw error;
    }
  }

  static async extractText(doc: Document): Promise<string[]> {
    if (!doc.chunks) {
      const parsedDoc = await this.parsePDF(doc);
      return parsedDoc.chunks || [];
    }
    return doc.chunks;
  }
} 