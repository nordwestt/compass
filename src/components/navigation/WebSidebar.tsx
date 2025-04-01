import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { TabBarIcon } from './TabBarIcon';
import { useThemePreset } from '@/src/components/ui/ThemeProvider';
import { rawThemes } from '@/constants/themes';
import { useColorScheme } from 'nativewind';
import { routes } from '@/app/(tabs)/_layout';
import { currentIndexAtom, syncToPolarisAtom } from '@/src/hooks/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CharacterService from '@/src/services/character/CharacterService';
import { polarisCharactersAtom, polarisProvidersAtom, polarisDocumentsAtom } from '@/src/hooks/atoms';
import ProviderService from '@/src/services/provider/ProviderService';
import { DocumentService } from '@/src/services/document/DocumentService';
import { Switch } from '@/src/components/ui/Switch';
interface Route {
  key: string;
  title: string;
  icon: string;
}


export function WebSidebar({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { themePreset, setThemePreset, availableThemes } = useThemePreset();
  const theme = rawThemes[themePreset][colorScheme ?? 'light'];
  const [polarisCharacters, setPolarisCharacters] = useAtom(polarisCharactersAtom);
  const [polarisProviders, setPolarisProviders] = useAtom(polarisProvidersAtom);
  const [syncToPolaris, setSyncToPolaris] = useAtom(syncToPolarisAtom);
  const [polarisDocuments, setPolarisDocuments] = useAtom(polarisDocumentsAtom);

  useEffect(() => {
    const fetchCharacters = async () => {
      if(syncToPolaris){


        const characters = await CharacterService.getCharacters();
        setPolarisCharacters(characters);
        const providers = await ProviderService.getProviders();
        setPolarisProviders(providers);
        const docs = await DocumentService.getDocuments();
        setPolarisDocuments(docs);
      }
    };
    fetchCharacters();
    
  }, [syncToPolaris]);

  const handleSetPolarisMode = (value: boolean) => {
    setSyncToPolaris(value);
    if (value) {
      setThemePreset('polaris');
    }
    else{
      setThemePreset(availableThemes[0]);
    }
  }

  return (
    <View className={`group h-full bg-background ${className}`}>
      {routes.map((route, index) => (
        <Pressable
          key={route.key}
          onPress={() => {
            setCurrentIndex(index);
            router.replace(`/${route.key === 'index' ? '' : route.key}` as any);
          }}
          className={`group-hover:w-32 z-20 w-14 transition-all duration-200 flex-row items-center justify-between p-4 m-2 rounded-lg hover:bg-surface ${
            currentIndex === index
              ? 'border-r border-primary border shadow-sm bg-surface'
              : ''
          }`}
        >
          <TabBarIcon
            name={route.icon as any}
            size={22}
            className={`w-12 ${currentIndex === index ? '!text-primary' : '!text-secondary'}`}
          />
          <Text
            className={`text-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              currentIndex === index ? 'text-primary' : 'text-secondary'
            }`}
          >
            {route.title}
          </Text>
        </Pressable>
      ))}
      <Pressable className="mt-auto mb-4" onPress={() => handleSetPolarisMode(!syncToPolaris)}>
        <View className="flex-col">
          <View className="flex-row items-center justify-start">
            <Ionicons name={syncToPolaris ? "cloud" : "cloud-outline"} size={24} className={`mx-auto ${syncToPolaris ? 'text-primary' : 'text-text'}`} />
          </View>
          <Switch className="mx-auto"
              value={syncToPolaris}
              onValueChange={(value) => handleSetPolarisMode(value)}
            />
          </View>
      </Pressable>
    </View>
  );
} 