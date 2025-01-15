import { Character } from "@/src/types/core";

import { Model } from "@/src/types/core";

export interface ImageProvider {
  generateImage(prompt: string, model: Model, signal?: AbortSignal): Promise<string>;
}
