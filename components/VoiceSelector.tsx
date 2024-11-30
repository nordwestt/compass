import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useVoices } from '@/hooks/useVoices';
import { Voice } from '@/types/core';
import { useAtom } from 'jotai';
import { defaultVoiceAtom } from '@/hooks/atoms';
import { Ionicons } from '@expo/vector-icons';

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const voices = useVoices();
  const [defaultVoice, setDefaultVoice] = useAtom(defaultVoiceAtom);

  if (!voices.length) {
    return <Text className="text-gray-500">Loading voices...</Text>;
  }

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center px-4 py-2 rounded-lg bg-background border-2 border-border"
      >
        <Ionicons name="mic" size={20} className="mr-2 text-gray-600 dark:text-gray-400" />
        <Text className="flex-1 text-black dark:text-white">
          {selectedVoice ? selectedVoice.name : 'Select Voice'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="rounded-t-xl max-h-[70%] bg-white">
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-center text-black dark:text-white">
                Select Voice
              </Text>
            </View>
            
            <ScrollView className="p-4">
              {voices.map((voice) => (
                <TouchableOpacity
                  key={voice.id}
                  onPress={() => {
                    onSelectVoice(voice);
                    setIsModalVisible(false);
                  }}
                  className="flex-row items-center p-3 mb-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-black dark:text-white">
                      {voice.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {voice.description}
                    </Text>
                  </View>
                  {selectedVoice?.id === voice.id && (
                    <View className="bg-primary px-2 py-1 rounded">
                      <Text className="text-white text-sm">Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="p-4 border-t border-gray-200 dark:border-gray-700 flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="flex-1 mr-2"
              >
                <Text className="text-center text-blue-500 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedVoice) {
                    setDefaultVoice(selectedVoice);
                  }
                  setIsModalVisible(false);
                }}
                className="flex-1 ml-2 bg-black py-2 px-4 rounded-lg"
              >
                <Text className="text-center text-white font-medium">
                  Set as Default
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}; 