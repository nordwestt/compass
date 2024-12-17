import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { ImageProviderFactory } from '@/src/services/image/ImageProviderFactory';
import { Model } from '@/types/core';
import { availableProvidersAtom } from '@/hooks/atoms';
import { useAtomValue } from 'jotai';
import { useWindowDimensions } from 'react-native';

// Predefined options to enhance prompt creation
const perspectives = [
  'close-up', 'wide-angle', 'aerial view', 'bird\'s eye view',
  'low angle', 'straight on', 'side view', 'isometric'
];

const lighting = [
  'natural light', 'soft lighting', 'dramatic lighting', 'sunset',
  'studio lighting', 'neon lights', 'moonlight', 'golden hour'
];

const styles = [
  'photorealistic', 'cinematic', 'anime', 'oil painting',
  'watercolor', '3D render', 'concept art', 'digital art'
];

const moods = [
  'peaceful', 'dramatic', 'mysterious', 'energetic',
  'melancholic', 'whimsical', 'ethereal', 'dark'
];

interface PromptTagProps {
  label: string;
  onPress: () => void;
}

const PromptTag: React.FC<PromptTagProps> = ({ label, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-background px-3 py-1 rounded-full m-1 border border-border"
  >
    <Text className="text-sm text-text">{label}</Text>
  </TouchableOpacity>
);

interface PromptSectionProps {
  title: string;
  items: string[];
  onSelectItem: (item: string) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({ title, items, onSelectItem }) => (
  <View className="mb-4">
    <Text className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{title}</Text>
    <View className="flex-row flex-wrap">
      {items.map((item) => (
        <PromptTag key={item} label={item} onPress={() => onSelectItem(item)} />
      ))}
    </View>
  </View>
);

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableProviders = useAtomValue(availableProvidersAtom);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = isWeb && width >= 768;

  const appendToPrompt = (text: string) => {
    setPrompt((current) => {
      const newPrompt = current ? `${current}, ${text}` : text;
      return newPrompt;
    });
  };

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

  const PromptPanel = (
    <View className={`h-full alal ${isWideScreen ? 'w-1/2 pr-4 h-full' : 'w-full'}`}>
      <View className="bg-surface rounded-xl p-4 border border-border flex-1 h-full">
        <View className="flex-row items-center">
            <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Prompt
            </Text>
        </View>
        
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder=""
          className="bg-background border border-border rounded-lg p-3 mb-4 
                     text-text min-h-[100]"
          multiline
        />

        <ScrollView className="overflow-y-auto">
          <PromptSection title="Style" items={styles} onSelectItem={appendToPrompt} />
          <PromptSection title="Perspective" items={perspectives} onSelectItem={appendToPrompt} />
          <PromptSection title="Lighting" items={lighting} onSelectItem={appendToPrompt} />
          <PromptSection title="Mood" items={moods} onSelectItem={appendToPrompt} />
        </ScrollView>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isLoading}
          className={`p-4 rounded-lg mt-4 ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white">Generating...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-semibold">Generate Image</Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text className="text-red-500 mt-2">{error}</Text>
        )}
      </View>
    </View>
  );

  const ImagePanel = generatedImage && (
    <View className={`${isWideScreen ? 'w-1/2 pl-4' : 'w-full mt-4'}`}>
      <View className="bg-surface rounded-xl p-4 shadow-lg flex-1">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Generated Image
        </Text>
        <View className="rounded-lg overflow-hidden border-4 border-gray-200 dark:border-gray-700">
          <Image
            source={{ uri: generatedImage }}
            className="w-full h-[400px]"
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="p-4 h-full" contentContainerStyle={{ height: '100%' }}>
      <View className={`flex flex-1 h-full ${isWideScreen ? 'flex-row' : 'flex-col'}`}>
        {PromptPanel}
        {ImagePanel}
      </View>
    </ScrollView>
  );
} 