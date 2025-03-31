import { ChatProvider } from "@/src/types/chat";
import { Character, Provider } from "@/src/types/core";
import { ChatMessage } from "@/src/types/core";
import { Model } from "@/src/types/core";
import LogService from "@/utils/LogService";
import { toastService } from "@/src/services/toastService";
import { CoreMessage, embedMany, generateText, streamText, tool } from "ai";
import { createOllama } from "ollama-ai-provider";
import { fetch as expoFetch } from "expo/fetch";
import { z } from "zod";
import { getProxyUrl } from "@/src/utils/proxy";
import { embed } from "ai";

import { Platform as PlatformCust } from "@/src/utils/platform";
import { streamPolarisResponse } from "@/src/services/chat/streamUtils";

export class PolarisProvider implements ChatProvider {
  provider: Provider;
  constructor(provider: Provider) {
    this.provider = provider;
  }
  async *sendMessage(
    messages: ChatMessage[],
    model: Model,
    character: Character,
    signal?: AbortSignal,
  ): AsyncGenerator<string> {
    const newMessages = [
      { role: "system", content: character.content },
      ...messages.map((message) => ({
        role: message.isUser
          ? "user"
          : message.isSystem
            ? "system"
            : "assistant",
        content: message.content,
      })),
    ];

    // if latest message is empty
    if (newMessages[newMessages.length - 1].content.trim() === "") {
      newMessages.pop();
    }

    try {
      let url = `${model.provider.endpoint}/api/chat/stream`;
      if (PlatformCust.isTauri) url = await getProxyUrl(url);
      console.log("Sending request to", url);
      // let response = await fetch(url, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.provider.apiKey}` },
      //   body: JSON.stringify({
      //     model: model.id,
      //     messages: newMessages,
      //     stream: false
      //   })
      // });
      // let data = await response.json();
      // return data.message.content;
      yield* streamPolarisResponse(
        url,
        {
          model: model.id,
          messages: newMessages,
          stream: true,
        },
        {
          Authorization: `Bearer ${this.provider.apiKey}`,
        },
      );
    } catch (error: any) {
      LogService.log(
        error,
        {
          component: "OllamaProvider",
          function: `sendMessage: ${model.provider.endpoint}`,
        },
        "error",
      );
      throw error;
    }
  }

  async sendSimpleMessage(
    message: string,
    model: Model,
    systemPrompt: string,
  ): Promise<string> {
    return "Test message";
  }

  async sendJSONMessage(
    message: string,
    model: Model,
    systemPrompt: string,
  ): Promise<any> {
    let url = `${model.provider.endpoint}/api/chat`;
    let response = await fetch(await getProxyUrl(url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: false,
        format: "json",
      }),
    });
    let data = await response.json();

    try {
      return JSON.parse(data.message.content);
    } catch (error) {
      return { query: "", searchRequired: false };
    }
  }

  async embedText(texts: string[]): Promise<number[][]> {
    let url = `${this.provider.endpoint}/api/embed`;
    if (PlatformCust.isTauri) url = await getProxyUrl(url);

    const ollama = createOllama({
      // optional settings, e.g.
      baseURL: await getProxyUrl(this.provider.endpoint + "/api"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
    });

    const { embeddings } = await embedMany({
      model: ollama.embedding("all-minilm"),
      values: texts,
    });

    return embeddings;
  }

  async getAvailableModels(): Promise<string[]> {
    const response = await fetch(
      await getProxyUrl(`${this.provider.endpoint}/api/chat/characters`),
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.provider.apiKey}`,
        },
      },
    );
    const data = await response.json();

    if (!(data && Array.isArray(data))) return [];
    return data
      .filter(
        (character: any) => character && typeof character.name === "string",
      )
      .map((character: any) => character.name);
  }
}
