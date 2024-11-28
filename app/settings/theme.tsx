import { View, ScrollView } from 'react-native';
  
import { ThemeSelector } from '@/components/ThemeSelector';
export default function ThemeSettingScreen() {
  
  return (
    <ThemeSelector className="shadow-lg m-2 rounded-lg bg-surface" />
  );
}
