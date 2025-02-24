import { View, ScrollView } from 'react-native';
  
import Providers from '@/src/components/providers/providers';
import { FontSelector } from '@/src/components/settings/FontSelector';
import { ProxySettings } from '@/src/components/settings/ProxySettings';
export default function GeneralSettingScreen() {
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
    <ProxySettings />
    </ScrollView>
  );
}
