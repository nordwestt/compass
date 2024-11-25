import { View, ScrollView } from 'react-native';
  
import Providers from '@/src/components/providers/providers';
import { FontSelector } from '@/src/components/settings/FontSelector';

export default function SettingsScreen() {
  
  return (
    <ScrollView className="flex-1 bg-gray-200 dark:bg-gray-900">
      <Providers className="shadow-lg m-2 rounded-lg" />
      <FontSelector className="shadow-lg m-2 rounded-lg" />
    </ScrollView>
  );
}
