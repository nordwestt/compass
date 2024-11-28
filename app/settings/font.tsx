import { View, ScrollView } from 'react-native';
  
import Providers from '@/src/components/providers/providers';
import { FontSelector } from '@/src/components/settings/FontSelector';
export default function FontSettingScreen() {
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
    <FontSelector className="bg-background" />
    </ScrollView>
  );
}
