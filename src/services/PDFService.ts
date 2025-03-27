import { Platform } from 'react-native';
import { Document } from '@/src/types/core';
import * as FileSystem from 'expo-file-system';
import LogService from '@/utils/LogService';
import { chunkText } from '@/src/utils/semanticSearch';

// Initialize pdf.js for web
let pdfjsLib: any;
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Load pdf.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(script);
  
  script.onload = () => {
    pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  };
}

export class PDFService {
  static async parsePDF(doc: Document): Promise<Document> {
    try {
      if (Platform.OS === 'web') {
        // Ensure pdf.js is loaded
        if (!pdfjsLib) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for script to load
          if (!pdfjsLib) {
            throw new Error('PDF.js failed to load');
          }
        }

        // For web, use pdf.js
        const arrayBuffer = await fetch(doc.path).then(res => res.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        
        let fullText = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Process text content with formatting
          let pageText = '';
          let currentY: number | null = null;
          let isInList = false;

          for (const item of textContent.items) {
            const textItem = item as any;
            
            // Check for new paragraph based on Y position change
            if (currentY !== null && Math.abs(textItem.transform[5] - currentY) > 12) {
              pageText += '\n\n';
            }
            
            // Check for bold text (fontName usually contains 'Bold' for bold text)
            if (textItem.fontName?.toLowerCase().includes('bold')) {
              pageText += `**${textItem.str}**`;
            } 
            // Check for potential list items
            else if (textItem.str.trim().match(/^[•\-\*]\s/)) {
              if (!isInList) pageText += '\n';
              pageText += textItem.str;
              isInList = true;
            }
            // Regular text
            else {
              pageText += textItem.str;
              isInList = false;
            }
            
            currentY = textItem.transform[5];
          }
          
          fullText += pageText + '\n\n';
        }

        // Split into chunks while preserving markdown
        const chunks = chunkText(fullText, 1000);

        return {
          ...doc,
          pages: numPages,
          chunks
        };
      } else {
        // For native platforms
        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(doc.path);
        if (!fileInfo.exists) {
          throw new Error('File not found');
        }

        // For now, return basic document info
        // We'll implement native PDF parsing later
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