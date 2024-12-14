import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAtomValue } from 'jotai';
import { generatedImagesAtom } from '@/hooks/atoms';
import { format } from 'date-fns';
import { ImageGenerator } from '@/components/ImageGenerator';
import { Gallery } from '@/components/Gallery';
type Tab = 'generator' | 'gallery';

export default function ImageGenerationScreen() {
  const [activeTab, setActiveTab] = React.useState<Tab>('generator');
  const images = useAtomValue(generatedImagesAtom);
  const screenWidth = Dimensions.get('window').width;
  const imageSize = screenWidth < 768 ? screenWidth / 2 - 24 : screenWidth / 4 - 32;

  const TabButton: React.FC<{
    tab: Tab;
    label: string;
  }> = ({ tab, label }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`w-32 py-3 m-2 rounded-lg hover:bg-surface ${
        activeTab === tab
          ? 'border border-primary shadow-sm bg-surface'
          : 'border-b-2 border-transparent'
      }`}
    >
      <Text
        className={`text-center ${
          activeTab === tab ? 'text-primary font-semibold' : 'text-text'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <Text className="text-2xl font-bold text-primary p-4">
            Images
      </Text>
      <View className="flex-row border-b border-border">
        <TabButton tab="generator" label="Generate" />
        <TabButton tab="gallery" label="Gallery" />
      </View>
      
      {activeTab === 'generator' ? (
        <ImageGenerator />
      ) : (
        <Gallery />
      )}
    </View>
  );
}