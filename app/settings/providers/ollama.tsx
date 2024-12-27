import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import { availableProvidersAtom } from '@/hooks/atoms';
import { EditOllama } from '@/src/components/providers/EditOllama';

export default function ProvidersSettingScreen() {
  console.log('ollama');

  const { id } = useLocalSearchParams();
  const [providers] = useAtom(availableProvidersAtom);
  
  const provider = providers.find(p => p.id === id);
  
  if (!provider) {
    return null;
  }
    
  return (
    <EditOllama provider={provider} />
  );
}
