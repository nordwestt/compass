import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EditCharacter from '@/src/components/character/EditCharacter';

export default function EditCharacterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  return <EditCharacter id={id} onSave={() => router.back()} />;
} 