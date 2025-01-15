import React from 'react';
import { View, Text } from 'react-native';
import { useAtom } from 'jotai';
import { fontPreferencesAtom } from '@/src/hooks/atoms';
import { Selector } from '@/src/components/Selector';
import { Message } from '@/src/components/chat/Message';

const AVAILABLE_FONTS = [
  { id: 'Caveat-Medium', name: 'Caveat Medium' },
  { id: 'Caveat-Regular', name: 'Caveat Regular' },
  { id: 'Caveat-Bold', name: 'Caveat Bold' },
  { id: 'SpaceMono', name: 'Space Mono' },
  { id: 'System', name: 'System Default' },
];

const FONT_SIZES = [10, 12, 14, 16, 18];
const LINE_HEIGHTS = [14, 18, 22];
const LETTER_SPACING_VALUES = [0, 0.4, 0.8, 1.2, 1.6];

const EXAMPLE_MESSAGE = "This is a **preview** message showing how your text will look.\n\nIt includes some `code` and multiple paragraphs to demonstrate spacing.";

interface FontSelectorProps {
  className?: string;
}
export function FontSelector({ className }: FontSelectorProps) {
  const [preferences, setPreferences] = useAtom(fontPreferencesAtom);

  const renderSelectors = () => {
    return <>
    <Selector
        title="Font Family"
        options={AVAILABLE_FONTS.map(font => ({
          label: font.name,
          value: font.id
        }))}
        value={preferences.fontFamily}
        onChange={(value) => setPreferences(prev => ({ ...prev, fontFamily: value }))}
        horizontal
      />

      <Selector
        title="Font Size"
        options={FONT_SIZES.map(size => ({
          label: `${size}px`,
          value: size
        }))}
        value={preferences.fontSize}
        onChange={(value) => setPreferences(prev => ({ ...prev, fontSize: value }))}
        horizontal
      />

      <Selector
        title="Line Height"
        options={LINE_HEIGHTS.map(height => ({
          label: `${height}px`,
          value: height
        }))}
        value={preferences.lineHeight}
        onChange={(value) => setPreferences(prev => ({ ...prev, lineHeight: value }))}
        horizontal
      />

      <Selector
        title="Letter Spacing"
        options={LETTER_SPACING_VALUES.map(spacing => ({
          label: `${spacing}`,
          value: spacing
        }))}
        value={preferences.letterSpacing}
        onChange={(value) => setPreferences(prev => ({ ...prev, letterSpacing: value }))}
        horizontal
      />

    </>
  }

  return (
    <View className={`p-4 ${className}`}>
      <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
        Message Appearance
      </Text>

      {renderSelectors()}

      <View className="mt-8 border rounded-lg p-4 border-gray-200 dark:border-gray-700">
        <Text className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Preview
        </Text>
        <Message
          content={EXAMPLE_MESSAGE}
          isUser={false}
        />
        <Message
          content="This is how your messages will look!"
          isUser={true}
        />
      </View>
    </View>
  );
} 