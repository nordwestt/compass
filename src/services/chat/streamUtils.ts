import { Model } from '@/src/types/core';

export async function* streamResponse(
  url: string,
  payload: any,
  parseChunk: (parsed: any) => string = (parsed) => parsed.message?.content || '',signal?: AbortSignal
): AsyncGenerator<string> {
    
  const response =  await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  signal,
  body: JSON.stringify({
      ...payload,
      stream: true
  })
  } as any);
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No reader available');
  }

  let buffer = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    buffer += chunk;

    const chunks = buffer.split("\n");
    for (const chunk of chunks) {
      try {
        const parsedChunk = JSON.parse(chunk);
        yield parseChunk(parsedChunk);
        buffer = '';
      } catch {
        continue;
      }
    }
  }
}