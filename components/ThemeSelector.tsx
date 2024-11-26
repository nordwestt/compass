import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ThemeSelectorProps {
  className?: string;
}
export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme, availableThemes } = useTheme();
  
  return (
    <View className={`p-4 bg-white dark:bg-gray-900 ${className}`}>
      <Text className="text-lg font-bold text-text mb-4">Theme</Text>
      <View className="flex-row flex-wrap gap-2">
        {availableThemes.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTheme(t.id)}
            className={`p-2 bg-gray-900 rounded-lg`}
          >
            <Text className={`text-white`}>
              {t.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
} 