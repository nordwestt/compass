import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { PREDEFINED_PROVIDERS } from '@/src/constants/providers';
import { Provider } from '@/types/core';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PROVIDER_LOGOS } from '@/src/constants/logos';
import { useState } from 'react';

interface ProviderTypeSelectorProps {
  className?: string;
  selectedType: Provider['source'];
  onTypeSelect: (type: Provider['source']) => void;
}

export function ProviderTypeSelector({ className, selectedType, onTypeSelect }: ProviderTypeSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedProvider = Object.values(PREDEFINED_PROVIDERS).find(
    provider => provider.source === selectedType
  );

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className={`flex-row items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 ${className}`}
      >
        {selectedType !== 'custom' && PROVIDER_LOGOS[selectedType as keyof typeof PROVIDER_LOGOS] && (
          <Image 
            source={PROVIDER_LOGOS[selectedType as keyof typeof PROVIDER_LOGOS]}
            className="!w-[48px] !h-[48px] rounded-full mr-2"
          />
        )}
        {selectedType === 'custom' && (
          <Ionicons 
            name="code" 
            size={24} 
            className="mr-2"
            color="#4B5563"
          />
        )}
        <Text className="flex-1 text-black dark:text-white">
          {selectedType === 'custom' ? 'Custom Provider' : selectedProvider?.name}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={24} 
          color="#4B5563"
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-center text-black dark:text-white">
                Select Provider Type
              </Text>
            </View>

            <View className="p-4">
              {Object.entries(PREDEFINED_PROVIDERS).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    onTypeSelect(value.source);
                    setIsModalVisible(false);
                  }}
                  className="flex-row items-center p-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  {PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS] && (
                    <Image
                      source={PROVIDER_LOGOS[value.source as keyof typeof PROVIDER_LOGOS]}
                      className="!w-[48px] !h-[48px] rounded-full mr-3"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="font-medium text-black dark:text-white">
                      {value.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {value.source} provider
                    </Text>
                  </View>
                  {selectedType === value.source && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color="#3B82F6"
                    />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => {
                  onTypeSelect('custom');
                  setIsModalVisible(false);
                }}
                className="flex-row items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <View className="w-[48px] h-[48px] rounded-full bg-gray-200 dark:bg-gray-600 mr-3 items-center justify-center">
                  <Ionicons 
                    name="code" 
                    size={24} 
                    color="#4B5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-black dark:text-white">
                    Custom Provider
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Configure a custom endpoint
                  </Text>
                </View>
                {selectedType === 'custom' && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color="#3B82F6"
                  />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-center text-blue-500 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
} 