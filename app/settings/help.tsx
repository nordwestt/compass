import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSetAtom } from 'jotai';
import { hasSeenOnboardingAtom } from '@/src/hooks/atoms';
import { OllamaHelp } from '@/src/components/settings/OllamaHelp';

export default function HelpSettingScreen() {
  const setHasSeenOnboarding = useSetAtom(hasSeenOnboardingAtom);

  const handleShowOnboarding = () => {
    setHasSeenOnboarding(false);
  };
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
      
      <OllamaHelp />
      <TouchableOpacity 
        onPress={handleShowOnboarding}
        className="bg-primary px-4 py-3 rounded-lg mb-4"
      >
        <Text className="text-white font-medium text-center">
          Show Welcome Introduction
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
