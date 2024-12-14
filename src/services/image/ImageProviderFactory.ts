import { Model } from '@/types/core';
import { ImageProvider } from '@/src/types/image';
import { ReplicateProvider } from './providers/ReplicateProvider';

export class ImageProviderFactory {
  static getProvider(model: Model): ImageProvider {
    switch (model.provider.source) {
      case 'replicate':
        return new ReplicateProvider();
      default:
        throw new Error(`Unsupported provider: ${model.provider.source}`);
    }
  }
} 