
import { ImageProviderFactory } from '@/src/services/image/ImageProviderFactory';
import { Model } from '@/types/core';
import { useAtom } from 'jotai';
import { generatedImagesAtom } from './atoms';
import { Platform } from 'react-native';
import { getTauriImageUri } from '@/components/Gallery';

export function useImageGeneration() {
  const [images, setImages] = useAtom(generatedImagesAtom);

  const generateImage = async (prompt: string, model: Model) => {
    const provider = ImageProviderFactory.getProvider(model);
    const imageUri = await provider.generateImage(prompt, model);
    setImages([...images, { id: Date.now().toString(), imagePath: imageUri, prompt: prompt, createdAt: new Date().toISOString() }]);

    if(Platform.OS === 'web') {   
      return getTauriImageUri(imageUri);
    }
    return imageUri;
  };

  return { generateImage };
} 