import React from 'react';
import { View } from 'react-native';
import { ImageGenerator } from '@/components/ImageGenerator';

export default function ImageGenerationScreen() {
  return (
    <View className="flex-1 bg-background">
      <ImageGenerator />
    </View>
  );
}