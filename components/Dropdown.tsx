import { View, Text, TouchableOpacity, Image, ScrollView, Pressable } from "react-native"
import React, { useState } from 'react';

export interface DropdownElement {
    title: string;
    id: string;
    image: string;
}

interface DropdownProps {
    children: DropdownElement[];
    selected: DropdownElement | null;
    onSelect: (child: DropdownElement) => void;
}

export const Dropdown = ({ children, selected, onSelect }: DropdownProps) => {

    const [isOpen, setIsOpen] = useState(false);
    
  return ( 
  
  <View>
    <View className="absolute h-screen w-screen top-0 left-0 right-0 bottom-0"><Pressable className="h-screen w-screen cursor-default" onPress={() => setIsOpen(false)}></Pressable></View>
    <TouchableOpacity 
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row items-center px-2 h-12 py-2 rounded-lg bg-background hover:bg-surface border border-border"
      >
        {selected?.image && (
          <Image source={selected.image as any} className="!h-[32px] !w-[32px] rounded-full mr-3"/>
        )}
        <Text className="font-medium text-black dark:text-white">
          {selected?.title}
        </Text>
      </TouchableOpacity>
      {isOpen && <View className="absolute z-200 mt-12 rounded-lg overflow-hidden w-64 max-h-64 bg-background border border-border shadow-lg">
        <ScrollView>
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            onPress={() => {
              onSelect(child);
              setIsOpen(false);
            }}
            className={`w-64 flex-row items-center p-3 hover:bg-surface`}
          >
            {child.image && (
              <Image source={child.image as any} className={`!h-[48px] !w-[48px] rounded-full mr-3  ${selected?.id === child.id ? "border-primary border-4" : ""}`}/>
            )}
            <View className="flex-1">
              <Text className="font-medium text-black dark:text-white">
                {child.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>}
    </View>
  )
  
}