import { View, ScrollView } from 'react-native';
  
import Providers from '@/src/components/providers/providers';
import { FontSelector } from '@/src/components/settings/FontSelector';
import { ThemeSelector } from '@/components/ThemeSelector';
export default function SettingsScreen() {
  
  return (
    <ScrollView className="flex-1 bg-background">
      <Providers className="shadow-lg m-2 rounded-lg bg-surface" />
      <FontSelector className="shadow-lg m-2 rounded-lg bg-surface" />
      {/* <ThemeSelector className="shadow-lg m-2 rounded-lg" /> */}
    </ScrollView>
  );
}
