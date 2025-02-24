import { Model } from '@/src/types/core';
import { ImageProvider } from '@/src/types/image';
import { ReplicateProvider } from './providers/ReplicateProvider';

export class ImageProviderFactory {
  static getProvider(model: Model): ImageProvider {
    switch (model.provider.name) {
      case 'Replicate':
        return new ReplicateProvider();
      default:
        throw new Error(`Unsupported provider: ${model.provider.name}`);
    }
  }
} 