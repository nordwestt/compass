import { View, ScrollView , Text, Pressable} from 'react-native';
import React, { useEffect, useState } from 'react';
import { TabBarIcon } from '@/src/components/navigation/TabBarIcon';
import AdminCharactersPanel from '@/src/components/polaris/AdminCharactersPanel';
import { Character } from '@/src/types/core';
import Documents from '@/src/components/polaris/documents';

export default function PolarisSettingScreen() {
  
    const routes = [
      { key: 'characters', title: 'Characters', icon: 'people' },
      { key: 'documents', title: 'Documents', icon: 'document-text' },
      { key: 'providers', title: 'Providers', icon: 'server' },
    ]
    const [currentIndex, setCurrentIndex] = useState(0);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [polarisCharacters, setPolarisCharacters] = useState<Character[]>([]);

    useEffect(() => {
      setCharacters(characters);
    }, [characters]);
    
  return (
    <View className="flex-1 bg-background p-4 flex-col border-4 border-primary">
      <View className="flex-row">
      {routes.map((route:any, index:number) => (
        <Pressable
          key={route.key}
          onPress={() => {
            setCurrentIndex(index);
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
      </View>
      <View className="flex-1">
        {currentIndex === 0 && <AdminCharactersPanel characters={characters} onSaveCharacter={() => {}} />}
        {currentIndex === 1 && <Documents />}
      </View>
    </View>
  );
}
