import { Document } from '@/src/types/core';
import { documentsAtom, syncToPolarisAtom } from '@/src/hooks/atoms';
import { getDefaultStore } from 'jotai';
import PolarisServer from '@/src/services/polaris/PolarisServer';
import { toastService } from '@/src/services/toastService';
import LogService from '@/utils/LogService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from '@/src/utils/platform';
import { PDFService } from '@/src/services/PDFService';

/**
 * DocumentService provides a unified interface for managing documents,
 * abstracting whether they're stored locally or on the Polaris server.
 */
export class DocumentService {
  /**
   * Get all available documents
   */
  static async getDocuments(): Promise<Document[]> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);

      if(syncToPolaris && !PolarisServer.isServerConnected()){
        await PolarisServer.connect("http://localhost:3000", "your_api_key_here");
      }
      
      // If syncing to Polaris and connected, get documents from server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        return await PolarisServer.getDocuments();
      } else {
        // Just get local documents
        return await this.getLocalDocuments();
      }
    } catch (error: any) {
      LogService.log(error, { component: 'DocumentService', function: 'getDocuments' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to load documents'
      });
      return [];
    }
  }

  /**
   * Upload a document (to server or locally)
   */
  static async uploadDocument(document: Document, fileData?: Blob): Promise<Document | null> {
    try {
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);

      if(syncToPolaris && !PolarisServer.isServerConnected()){
        await PolarisServer.connect("http://localhost:3000", "your_api_key_here");
      }
      
      // If syncing to Polaris and connected, upload to server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        return await PolarisServer.uploadDocument(document, fileData);
      } else {
        // Process locally
        const parsedDoc = await PDFService.parsePDF(document);
        
        // Save to local storage
        const localDocuments = await this.getLocalDocuments();
        const updatedDocuments = [...localDocuments, parsedDoc];
        await this.saveLocalDocuments(updatedDocuments);
        
        return parsedDoc;
      }
    } catch (error: any) {
      LogService.log(error, { component: 'DocumentService', function: 'uploadDocument' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to upload document'
      });
      return null;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<boolean> {
    try {
        console.log('deleting document from server', id);
      const syncToPolaris = await getDefaultStore().get(syncToPolarisAtom);
      
      // If it's a server resource and we're syncing, delete from server
      if (syncToPolaris && PolarisServer.isServerConnected()) {
        console.log('deleting document from server', id);
        const success = await PolarisServer.deleteDocument(id);
        
        if(success){
          toastService.success({
            title: 'Deleted',
            description: 'Document deleted from server'
          });
          return true;
        }
        else {
          toastService.danger({
            title: 'Error',
            description: 'Failed to delete document from server'
          });
          return false;
        }
      }
      
      return true;
    } catch (error: any) {
      LogService.log(error, { component: 'DocumentService', function: 'deleteDocument' }, 'error');
      toastService.danger({
        title: 'Error',
        description: 'Failed to delete document'
      });
      return false;
    }
  }

  /**
   * Get documents from local storage
   */
  private static async getLocalDocuments(): Promise<Document[]> {
    try {
      if (Platform.isMobile) {
        const storedDocs = await AsyncStorage.getItem('documents');
        return storedDocs ? JSON.parse(storedDocs) : [];
      } else {
        const storedDocs = localStorage.getItem('documents');
        return storedDocs ? JSON.parse(storedDocs) : [];
      }
    } catch (error: any) {
      LogService.log(error, { component: 'DocumentService', function: 'getLocalDocuments' }, 'error');
      return [];
    }
  }

  /**
   * Save documents to local storage
   */
  private static async saveLocalDocuments(documents: Document[]): Promise<void> {
    try {
      // Update Jotai store
      getDefaultStore().set(documentsAtom, documents);
      
      // Also update AsyncStorage/localStorage for persistence
      if (Platform.isMobile) {
        await AsyncStorage.setItem('documents', JSON.stringify(documents));
      } else {
        localStorage.setItem('documents', JSON.stringify(documents));
      }
    } catch (error: any) {
      LogService.log(error, { component: 'DocumentService', function: 'saveLocalDocuments' }, 'error');
      throw error;
    }
  }
} 