import { View, Text, TouchableOpacity } from 'react-native';
import { useThemePreset } from '@/src/components/ui/ThemeProvider';
import { rawThemes } from '@/constants/themes';

export interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { themePreset, setThemePreset, availableThemes } = useThemePreset();
  
  return (
    <View className={`p-4 flex-1 bg-background ${className}`}>
      <Text className="text-lg font-bold text-text mb-4">Theme</Text>
      <View className="grid grid-cols-2 gap-4">
        {availableThemes.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setThemePreset(t)}
            className={`p-4 rounded-lg h-24 shadow-lg ${
              themePreset === t ? 'border-2 border-primary' : ''
            }`}
            style={{
              backgroundColor: rawThemes[t].light.surface,
            }}
          >
            <Text style={{ color: rawThemes[t].light.text }}
                  className="text-xl font-semibold mb-2">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            
            {/* Color Preview Circles */}
            <View className="flex-row space-x-2 mt-2">
              {['primary', 'secondary', 'background', 'surface', 'text'].map(colorKey => (
                <View
                  key={colorKey}
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: (rawThemes as any)[t].light[colorKey] as any,
                    borderWidth: 1,
                    borderColor: rawThemes[t].light.border,
                  }}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
} 