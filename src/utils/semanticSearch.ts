// ... existing code ...

import LogService from "@/utils/LogService";
import { ChatProvider } from "../types/chat";
import { ChatProviderFactory } from "../services/chat/ChatProviderFactory";
import { Thread } from "../types/core";

interface SearchResult {
    text: string;
    similarity: number;
}
  
export function chunkText(text: string, maxChunkSize: number = 512): string[] {
  // Use a more sophisticated regex that preserves currency and decimal numbers
  // This regex looks for sentence boundaries but ignores periods in numbers
  const sentenceRegex = /(?<!\d)(?<!\.\d)[.!?](?=\s|$)/g;
  
  // Split the text into sentences using the regex
  const sentences = text.split(sentenceRegex).map(s => s.trim()).filter(s => s.length > 0);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // Add sentence ending punctuation back (it was removed in the split)
    const sentenceWithPunctuation = sentence + (
      text.substring(
        text.indexOf(sentence) + sentence.length, 
        text.indexOf(sentence) + sentence.length + 1
      ).match(/[.!?]/) ? text.substring(
        text.indexOf(sentence) + sentence.length, 
        text.indexOf(sentence) + sentence.length + 1
      ) : '.'
    );
    
    if ((currentChunk + sentenceWithPunctuation).length <= maxChunkSize) {
      currentChunk += sentenceWithPunctuation;
    } else {
      // If the current sentence alone exceeds maxChunkSize, we need to split it
      if (sentenceWithPunctuation.length > maxChunkSize) {
        // If currentChunk is not empty, add it to chunks first
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Split the long sentence into smaller parts without breaking words
        let remainingSentence = sentenceWithPunctuation;
        while (remainingSentence.length > 0) {
          // Find a good breaking point (space) near the maxChunkSize
          let breakPoint = maxChunkSize;
          if (remainingSentence.length > maxChunkSize) {
            breakPoint = remainingSentence.lastIndexOf(' ', maxChunkSize);
            if (breakPoint === -1) breakPoint = maxChunkSize; // If no space found, break at maxChunkSize
          } else {
            breakPoint = remainingSentence.length;
          }
          
          chunks.push(remainingSentence.substring(0, breakPoint).trim());
          remainingSentence = remainingSentence.substring(breakPoint).trim();
        }
      } else {
        // Normal case: add current chunk and start a new one
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentenceWithPunctuation;
      }
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
}
  
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
  
export async function searchRelevantPassages(
  searchQuery: string,
  fullText: string,
  provider: ChatProvider,
  options: {
    maxChunkSize?: number;
    minSimilarity?: number;
    maxResults?: number;
  } = {}
): Promise<SearchResult[]> {
  const {
    maxChunkSize = 512,
    minSimilarity = 0.7,
    maxResults = 3
  } = options;

  try {
    // Split text into chunks
    const chunks = chunkText(fullText, maxChunkSize);

    // Get query embedding
    const queryEmbedding = (await provider.embedText([searchQuery]))[0];

    // Get embeddings for all chunks
    const chunkEmbeddings = await provider.embedText(chunks);

    // Calculate similarities and sort results
    const results: SearchResult[] = chunks
      .map((chunk, index) => ({
        text: chunk,
        similarity: cosineSimilarity(queryEmbedding, chunkEmbeddings[index])
      }))
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);

    return results;
  } catch (error: any) {
    LogService.log(error, {
      component: 'OllamaProvider',
      function: 'searchRelevantPassages'
    }, 'error');
    throw error;
  }
}
  

export const isSearchRequired = async (message: string, provider: ChatProvider, currentThread: Thread) : Promise<{query: string, searchRequired: boolean}> => {
  const systemPrompt = `
  Your name is SearchAssistantBot, and you identify if the user's message requires a search on the internet.
  If the user's message requires a search, return the query to be searched and set "searchRequired" to true. 
  If the user's message does not require a search, simply return an empty string and set "searchRequired" to false.
  Examples:
  - "What is the weather in Tokyo?" -> {"query": "weather in Tokyo", "searchRequired": true}
  - "What is the capital of France?" -> {"query": "", "searchRequired": false}
  `;

  return await provider.sendJSONMessage(message, currentThread.selectedModel, systemPrompt);
}