import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';

interface SelectorProps<T> {
  title?: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  horizontal?: boolean;
}

export function Selector<T>({ 
  title,
  options, 
  value, 
  onChange, 
  className,
  horizontal = false
}: SelectorProps<T>) {
  const Container = horizontal ? ScrollView : View;
  const containerProps = horizontal ? { horizontal: true, showsHorizontalScrollIndicator: false } : {};

  return (
    <View className="">
      {title && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </Text>
      )}
      <Container {...containerProps}>
        <View className={`${horizontal ? 'flex-row' : 'flex-row flex-wrap'} ${className} p-2 rounded-lg`}>
          {options.map((option) => (
            <TouchableOpacity
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              className={`mr-2 px-4 py-2 rounded-lg ${
                value === option.value
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`${
                  value === option.value
                    ? 'text-white'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Container>
    </View>
  );
}
