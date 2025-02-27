import { View, Text, TouchableOpacity, Image, Pressable, Platform } from "react-native"
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import { ScrollView } from "react-native-gesture-handler";
import { TextInput } from "react-native-gesture-handler";
import { useAtom } from 'jotai';
import { keyboardEventAtom } from '../../hooks/useKeyboardShortcuts';

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
    className?: string;
}

export const Dropdown = ({ children, selected, onSelect, showSearch = false, className }: DropdownProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [keyboardEvent] = useAtom(keyboardEventAtom);
    
    // Add ref for the TextInput
    const searchInputRef = React.useRef<TextInput>(null);
    const scrollViewRef = React.useRef<ScrollView>(null);
    
    // Constants for item height calculation
    const ITEM_HEIGHT = 72; // Height of each item (48px image + padding)
    const SEARCH_HEIGHT = 61; // Height of search box (including padding and border)

    // Focus input when dropdown opens
    React.useEffect(() => {
        if (isOpen && showSearch) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, showSearch]);


    const filteredChildren = children.filter(child =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset highlighted index when search query changes or dropdown opens
    React.useEffect(() => {
        setHighlightedIndex(filteredChildren.length > 0 ? 0 : -1);
    }, [searchQuery, isOpen]);

    // Handle keyboard events from the global listener
    React.useEffect(() => {
        if (!isOpen || !keyboardEvent) return;
        console.log("keyboardEvent", keyboardEvent)
        switch (keyboardEvent.key) {
            case 'ArrowDown':
            case 'ArrowUp':

                searchInputRef.current?.blur();
                
                if (keyboardEvent.key === 'ArrowDown') {
                    setHighlightedIndex(prev => 
                        prev < filteredChildren.length - 1 ? prev + 1 : prev
                    );
                } else {
                    setHighlightedIndex(prev => 
                        prev > 0 ? prev - 1 : prev
                    );
                }
                break;
            case 'Enter':
                if (highlightedIndex >= 0 && highlightedIndex < filteredChildren.length) {
                    onSelect(filteredChildren[highlightedIndex]);
                    setIsOpen(false);
                }
                break;
        }
    }, [keyboardEvent, isOpen]);

    const scrollView = () =>{
      return (
        <ScrollView ref={scrollViewRef}>
          {showSearch && (
            <View className="p-2 border-b border-border">
              <TextInput
                ref={searchInputRef}
                className="px-3 py-2 bg-surface rounded-md text-black dark:text-white"
                placeholder="Search..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onKeyPress={(e) => {
                  switch (e.nativeEvent.key) {
                    case 'ArrowDown':
                    case 'ArrowUp':
                        // Blur the input when using arrow keys
                        searchInputRef.current?.blur();
                        console.log("ArrowDown or ArrowUp")
                        break;
                  }
                }}
              />
            </View>
          )}
          {filteredChildren.map((child, index) => (
            <TouchableOpacity
              key={child.id}
              onPress={() => {
                onSelect(child);
                setIsOpen(false);
              }}
              className={`w-64 flex-row items-center p-3 ${
                index === highlightedIndex ? 'bg-surface' : ''
              } hover:bg-surface`}
            >
              {child.image && (
                <Image source={{uri: child.image as any}} className={`!h-[48px] !w-[48px] rounded-full mr-3  ${selected?.id === child.id ? "border-primary border-4" : ""}`}/>
              )}
              <View className="flex-1">
                <Text className="font-medium text-text truncate" numberOfLines={1}>
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
          //setIsOpen(false)
        }, 200)
      }
    }}
        onPress={() => {
          setIsOpen(!isOpen)
        }}
        className={`flex-row items-center px-2 h-12 py-2 rounded-lg bg-background hover:opacity-70 border border-border ${className}`}
      >
        {selected?.image && (
          <Image source={selected.image as any} className="!h-[32px] !w-[32px] rounded-full mr-3"/>
        )}
        <Text className="font-medium text-black dark:text-white truncate" numberOfLines={1}>
          {selected?.title}
        </Text>
      </TouchableOpacity>
      {isOpen && <View className="z-200 absolute mt-12 rounded-lg overflow-hidden w-64 max-h-64 bg-background border border-border shadow-lg">
        {scrollView()}
      </View>}
      
    </View>
  )
  
}