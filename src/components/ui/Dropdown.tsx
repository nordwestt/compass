import { View, Text, TouchableOpacity, Image, Pressable, Platform } from "react-native"
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { ScrollView } from "react-native-gesture-handler";
import { TextInput } from "react-native-gesture-handler";

export interface DropdownElement {
    title: string;
    id: string;
    image: string;
}

interface DropdownProps {
    children: DropdownElement[];
    selected: DropdownElement | null;
    onSelect: (child: DropdownElement) => void;
    showSearch?: boolean;
}

export const Dropdown = ({ children, selected, onSelect, showSearch = false }: DropdownProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChildren = children.filter(child =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollView = () =>{
      return (
        <ScrollView>
          {showSearch && (
            <View className="p-2 border-b border-border">
              <TextInput
                className="px-3 py-2 bg-surface rounded-md text-black dark:text-white"
                placeholder="Search..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}
          {filteredChildren.map((child) => (
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
      )
    }
    
  return ( 
  
  <View>
    <TouchableOpacity onBlur={() => {
      if(isOpen) {
        console.log("isOpen", isOpen)
        setTimeout(() => {
          setIsOpen(false)
        }, 200)
      }
    }}
        onPress={() => {
          setIsOpen(!isOpen)
        }}
        className="flex-row items-center px-2 h-12 py-2 rounded-lg bg-background hover:bg-surface border border-border"
      >
        {selected?.image && (
          <Image source={selected.image as any} className="!h-[32px] !w-[32px] rounded-full mr-3"/>
        )}
        <Text className="font-medium text-black dark:text-white">
          {selected?.title}
        </Text>
      </TouchableOpacity>
      {isOpen && <View className="z-200 absolute mt-12 rounded-lg overflow-hidden w-64 max-h-64 bg-background border border-border shadow-lg">
        {scrollView()}
      </View>}
      
    </View>
  )
  
}