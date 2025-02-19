// ... existing code ...

import LogService from "@/utils/LogService";
import { ChatProvider } from "../types/chat";

interface SearchResult {
    text: string;
    similarity: number;
}
  
  function chunkText(text: string, maxChunkSize: number = 512): string[] {
    // Split into sentences (basic implementation)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';
  
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
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
  