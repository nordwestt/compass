import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ImageProviderFactory } from '@/src/services/image/ImageProviderFactory';
import { Model } from '@/types/core';
import { availableProvidersAtom } from '@/hooks/atoms';
import { useAtomValue } from 'jotai';


export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableProviders = useAtomValue(availableProvidersAtom);

  const handleGenerate = async () => {


    const provider = availableProviders.find(p => p.source === 'replicate');
    if (!provider) {
      setError('Provider not found');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    const model = {
      id: 'black-forest-labs/flux-schnell',
      name: 'Flux Schnell',
      provider: provider
    };

    try {
      const provider = ImageProviderFactory.getProvider(model);
      const imageUri = await provider.generateImage(prompt, model);
      setGeneratedImage(imageUri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-4">
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter your image prompt..."
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-black dark:text-white"
        multiline
      />

      <TouchableOpacity
        onPress={handleGenerate}
        disabled={isLoading}
        className={`p-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
      >
        {isLoading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator color="white" className="mr-2" />
            <Text className="text-white">Generating...</Text>
          </View>
        ) : (
          <Text className="text-white text-center">Generate Image</Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 mt-2">{error}</Text>
      )}

      {generatedImage && !isLoading && (
        <View className="mt-4">
          <Image
            source={{ uri: generatedImage }}
            className="w-full h-[300px] rounded-lg"
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
} 