import { Model } from "@/src/types/core";

export interface streamOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  parseChunk?: (parsed: any) => string;
}
export async function* streamOpenAIResponse(
  url: string,
  payload: any,
  options?: streamOptions,
): AsyncGenerator<string> {
  let parseChunk = (parsed: any) => parsed?.choices[0]?.delta?.content || "";
  if (options?.parseChunk) {
    parseChunk = options.parseChunk;
  }
  let headers = { "Content-Type": "application/json" };
  if (options?.headers) {
    headers = {
      ...headers,
      ...options.headers,
    };
  }

  console.log("streaming response", url);
  const response = await fetch(url, {
    method: "POST",
    headers,
    signal: options?.signal,
    body: JSON.stringify({
      ...payload,
      stream: true,
    }),
  } as any);
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader available");
  }

  let buffer = "";
  const decoder = new TextDecoder();

  let error = false;

  while (true) {
    console.log("reading");
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    buffer += chunk;
    const chunks = buffer.split("\n\n");
    for (const chunk of chunks) {
      try {
        let bob = chunk.split("data: ")[1];
        if (!bob) {
          continue;
        }
        const parsedChunk = JSON.parse(bob);
        yield parseChunk(parsedChunk);
        buffer = "";
      } catch {
        console.log("failed", chunk);
        continue;
      }
    }
  }
}

export async function* streamOllamaResponse(
  url: string,
  payload: any,
  headers?: Record<string, string>,
  parseChunk: (parsed: any) => string = (parsed) =>
    parsed.message?.content || "",
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    signal,
    body: JSON.stringify({
      ...payload,
      stream: true,
    }),
  } as any);
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader available");
  }

  let buffer = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    console.log("chunk", done, value);
    if (done) break;

    const chunk = decoder.decode(value);
    buffer += chunk;

    const chunks = buffer.split("\n");
    for (const chunk of chunks) {
      try {
        const parsedChunk = JSON.parse(chunk);
        yield parseChunk(parsedChunk);
        buffer = "";
      } catch {
        continue;
      }
    }
  }
}

export async function* streamPolarisResponse(
  url: string,
  payload: any,
  headers?: Record<string, string>,
  parseChunk: (parsed: any) => string = (parsed) =>
    parsed.message?.content || "",
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    signal,
    body: JSON.stringify({
      ...payload,
      stream: true,
    }),
  } as any);
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader available");
  }

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    // Convert the received chunks to text
    const chunk = new TextDecoder().decode(value);
    let lines = chunk.split("\n");
    for (let line of lines) {
      if (line.startsWith("0:")) yield line.substring(3, line.length - 1);
    }
  }
}
