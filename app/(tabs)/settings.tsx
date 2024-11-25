import { View } from 'react-native';
  
import { Provider } from '@/types/core';
import Providers from '@/src/components/providers/providers';

export default function SettingsScreen() {
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Providers />
    </View>
  );
}
