import { View, ScrollView } from 'react-native';
  
import { OllamaHelp } from '@/src/components/settings/OllamaHelp';
export default function HelpSettingScreen() {
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
    <OllamaHelp />
    </ScrollView>
  );
}
