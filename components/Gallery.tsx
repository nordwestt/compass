import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { GeneratedImage, generatedImagesAtom } from '@/hooks/atoms';
import { format } from 'date-fns';
import { open, BaseDirectory, readFile } from "@tauri-apps/plugin-fs"
function isTauri(){
  return typeof window !== 'undefined' && !!(window as any).__TAURI__;
}

export async function getTauriImageUri(imagePath: string) {
  if(!isTauri()) {
    return imagePath;
  }
  const byteContents = await readFile(imagePath, { baseDir: BaseDirectory.Picture });
  // Create a Blob from the byte contents
  const blob = new Blob([byteContents], { type: 'image/webp' });
  // Create and return an object URL
  return URL.createObjectURL(blob);
}

export function Gallery() {
  const [images, setImages] = useAtom(generatedImagesAtom);
  const [loadedImages, setLoadedImages] = useState<GeneratedImage[]>([]);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth < 768 ? screenWidth / 2 - 24 : screenWidth / 4 - 32;

  useEffect(() => {
    const loadImageUris = async () => {
      const imagesWithUris = await Promise.all(
        images.map(async (image) => ({
          ...image,
          imagePath: await getTauriImageUri(image.imagePath)
        }))
      );
      setLoadedImages(imagesWithUris);
    };

    loadImageUris();
  }, [images]);

  if (images.length === 0) {
    return (
      <View className="flex-1 bg-background p-4 justify-center items-center">
        <Text className="text-text text-lg text-center mb-2">
          No images generated yet
        </Text>
        <Text className="text-gray-500 text-center">
          Generate some images and they will appear here
        </Text>
      </View>
    );
  }
  

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-text mb-4">
        Generated Images
      </Text>
      
      <View className="flex-row flex-wrap gap-4">
        {loadedImages.map((image) => (
          <View 
            key={image.id} 
            className="bg-surface rounded-lg overflow-hidden shadow-md"
            style={{ width: imageSize }}
          >
            <Image
              source={{ uri: image.imagePath }}
              className="w-full aspect-square"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="text-xs text-gray-500 mb-2">
                {format(new Date(image.createdAt), 'MMM d, yyyy h:mm a')}
              </Text>
              <Text className="text-sm text-text" numberOfLines={3}>
                {image.prompt}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 