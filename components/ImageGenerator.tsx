import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform, ScrollView, Pressable } from 'react-native';
import { ImageProviderFactory } from '@/src/services/image/ImageProviderFactory';
import { Model } from '@/types/core';
import { availableProvidersAtom } from '@/hooks/atoms';
import { useAtomValue } from 'jotai';
import { useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useThemePreset } from '@/components/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import Modal from 'react-native-modal';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { toastService } from '@/services/toastService';


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
    className="bg-background hover:bg-surface px-3 py-1 rounded-full m-1 border border-border"
  >
    <Text className="text-sm text-text">{label}</Text>
  </TouchableOpacity>
);

interface PromptSectionProps {
  title: string;
  items: string[];
  icon: string;
  onSelectItem: (item: string) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({ title, items, icon, onSelectItem }) => (
  <View className="mb-4">
    <View className="flex-row items-center p-2">
      <MaterialCommunityIcons name={icon as any} size={24} className="!text-primary" />
      <Text className="text-sm font-semibold text-primary">{title}</Text>
    </View>
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
  const { themePreset } = useThemePreset();
  const { colorScheme } = useColorScheme();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const { generateImage } = useImageGeneration();

  const appendToPrompt = (text: string) => {
    setPrompt((current) => {
      const newPrompt = current ? `${current}, ${text}` : text;
      return newPrompt;
    });
  };

  const handleGenerate = async () => {
    
    const provider = availableProviders.find(p => p.source === 'replicate');
    if (!provider) {
      toastService.info({
        title: 'Provider not found',
        description: 'Please add a provider to generate images',
      });
      return;
    }

    if (!prompt.trim()) {
      toastService.info({
        title: 'Please enter a prompt',
        description: 'Please enter a prompt to generate an image',
      });
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
      const imageUri = await generateImage(prompt, model);
      setGeneratedImage(imageUri);
    } catch (err) {
      toastService.danger({
        title: 'Failed to generate image',
        description: err instanceof Error ? err.message : 'Failed to generate image',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ImagePanel = generatedImage && (
    <View className={`${isWideScreen ? 'w-1/2 pl-4' : 'w-full mt-4'}`}>
      <View className="bg-surface rounded-xl p-4 shadow-lg flex-1">
        <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Generated Image
        </Text>
        <Pressable onPress={() => setIsImageViewVisible(true)}>
          <Image
            source={{ uri: generatedImage }}
            className="w-full h-[400px] border-primary border-4 rounded-lg overflow-hidden"
            resizeMode="cover"
          />
        </Pressable>

        {(
          <Modal
            isVisible={isImageViewVisible}
            onBackdropPress={() => setIsImageViewVisible(false)}
            onSwipeComplete={() => setIsImageViewVisible(false)}
            swipeDirection={['down']}
            className="m-0 flex items-center justify-center"
          >
            <View className="w-[70vw] flex-1 mx-auto flex items-center justify-center">
            <TouchableOpacity 
                onPress={() => setIsImageViewVisible(false)}
                className="absolute right-4 top-4 z-10 bg-black/50 rounded-full p-2"
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Image
                source={{ uri: generatedImage }}
                className="w-[70vw] flex-1 rounded-lg overflow-hidden"
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </View>
  );

  const PromptPanel = (
    <View className={`h-full alal ${isWideScreen && generatedImage ? 'w-1/2 pr-4 h-full' : 'w-full'}`}>
      <View className="bg-surface rounded-xl p-4 border border-border flex-1 h-full">
        <View className="flex-row items-center">
            <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Prompt
            </Text>
        </View>
        
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type your prompt here..."
          placeholderTextColor={theme.text}
          className="bg-background border border-border rounded-lg p-3 mb-4 
                     text-text min-h-[100]"
          multiline
        />

        <ScrollView className="overflow-y-auto">
          <PromptSection icon="palette" title="Style" items={styles} onSelectItem={appendToPrompt} />
          <PromptSection icon="pine-tree" title="Perspective" items={perspectives} onSelectItem={appendToPrompt} />
          <PromptSection icon="track-light" title="Lighting" items={lighting} onSelectItem={appendToPrompt} />
          <PromptSection icon="guy-fawkes-mask" title="Mood" items={moods} onSelectItem={appendToPrompt} />
          {Platform.OS !== 'web' && generatedImage && ImagePanel}
        </ScrollView>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isLoading}
          className={`p-4 rounded-lg mt-4 ${isLoading ? 'bg-gray-400' : 'bg-primary hover:opacity-80'}`}
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

  

  return (
    <ScrollView className="p-4 h-full" contentContainerStyle={{ height: '100%' }}>
      <View className={`flex flex-1 h-full ${isWideScreen ? 'flex-row' : 'flex-col'}`}>
        {PromptPanel}
        {isWideScreen && ImagePanel}
      </View>
    </ScrollView>
  );
} 