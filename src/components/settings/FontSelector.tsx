import React from 'react';
import { View, Text } from 'react-native';
import { useAtom } from 'jotai';
import { fontPreferencesAtom } from '@/hooks/atoms';
import { Selector } from '@/src/components/Selector';

const AVAILABLE_FONTS = [
  { id: 'Caveat-Medium', name: 'Caveat Medium' },
  { id: 'Caveat-Regular', name: 'Caveat Regular' },
  { id: 'Caveat-Bold', name: 'Caveat Bold' },
  { id: 'SpaceMono', name: 'Space Mono' },
  { id: 'System', name: 'System Default' },
];

const FONT_SIZES = [14, 16, 18, 20, 22];
const LINE_HEIGHTS = [18, 20, 24, 28, 32];
const LETTER_SPACING_VALUES = [0, 0.4, 0.8, 1.2, 1.6];
const MESSAGE_GAPS = [2, 4, 6, 8, 10];

export function FontSelector() {
  const [preferences, setPreferences] = useAtom(fontPreferencesAtom);

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Message Appearance
      </Text>

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

      <Selector
        title="Message Gap"
        options={MESSAGE_GAPS.map(gap => ({
          label: `${gap}`,
          value: gap
        }))}
        value={preferences.messageGap}
        onChange={(value) => setPreferences(prev => ({ ...prev, messageGap: value }))}
        horizontal
      />
    </View>
  );
} 