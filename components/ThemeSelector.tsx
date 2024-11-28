import { View, Text, TouchableOpacity } from 'react-native';
import { useThemePreset } from '@/components/ThemeProvider';

export interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { themePreset, setThemePreset, availableThemes } = useThemePreset();
  
  return (
    <View className={`p-4 flex-1 bg-background ${className}`}>
      <Text className="text-lg font-bold text-text mb-4">Theme</Text>
      <View className="flex-col space-y-4">
        {availableThemes.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setThemePreset(t)}
            className={`p-4 bg-surface rounded-lg shadow-lg ${
              themePreset === t ? 'border-4 border-primary' : ''
            }`}
          >
            <Text className="text-xl font-semibold text-text">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
} 