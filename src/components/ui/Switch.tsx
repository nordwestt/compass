import { Switch as RNSwitch } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useThemePreset } from './ThemeProvider';
import { rawThemes } from '@/constants/themes';

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ value, onValueChange, className }: ThemedSwitchProps) {
  const { colorScheme } = useColorScheme();
  const { themePreset } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];

  return (
    <RNSwitch
      className={className}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: theme.primary }}
      thumbColor={theme.surface}
      activeThumbColor={theme.surface}
    />
  );
}