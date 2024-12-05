import { logsAtom } from '@/hooks/atoms';
import { useAtomValue } from 'jotai';
import { View, ScrollView, Text } from 'react-native';
  
export default function LogsScreen() {
  const logs = useAtomValue(logsAtom);
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-text mb-2">Logs</Text>
      {logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, index) => (
        <View key={index} className="bg-surface p-4 rounded-lg border border-border mb-2">
          <Text className="text-secondary">--------------------------------</Text>
          <Text className="text-secondary">Component: {log.component}</Text>
          <Text className="text-secondary">Function: {log.function}</Text>
          <Text className="text-secondary">Date: {log.date}</Text>
          <Text className="text-secondary">Message: {log.message}</Text>
          <Text className="text-secondary">--------------------------------</Text>
        </View>
      ))}
    </ScrollView>
  );
}
