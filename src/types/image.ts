import { Character } from "@/types/core";

import { Model } from "@/types/core";

export interface ImageProvider {
  generateImage(prompt: string, model: Model, signal?: AbortSignal): Promise<string>;
}
