import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useVoices } from '@/hooks/useVoices';
import { Voice } from '@/src/types/core';
import { useAtom, useAtomValue } from 'jotai';
import { availableProvidersAtom, defaultVoiceAtom, ttsEnabledAtom } from '@/hooks/atoms';
import { Ionicons } from '@expo/vector-icons';
import { toastService } from '@/src/services/toastService';
import { ThemeProvider } from '@/src/components/ui/ThemeProvider';


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
  const [ttsEnabled, setTtsEnabled] = useAtom(ttsEnabledAtom);

  const providers = useAtomValue(availableProvidersAtom);
  const ttsProviders = () =>providers.filter(p => p.capabilities?.tts || p.source === 'elevenlabs');
  

  const showTTSDisabledToast = () => {
    toastService.info({
      title: 'TTS not available',
      description: 'Please select an ElevenLabs provider to enable TTS'
    });
    setDefaultVoice(null);
  }


  return (
    <>
    <View className="flex-row items-center flex-1 justify-between border border-border rounded-lg">
      <TouchableOpacity 
        onPress={() => ttsProviders().length ? setIsModalVisible(true) : showTTSDisabledToast()}
        className="flex-row items-center px-4 py-2 h-12 bg-background rounded-l-lg border-r border-border hover:bg-surface"
      >
            <Ionicons name="mic" size={20} className="mr-2 text-gray-600 dark:text-gray-400" />
            <Text className="flex-1 text-black dark:text-white">
            {selectedVoice ? selectedVoice.name : 'Select Voice'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
              if(ttsProviders().length){
                toastService.success({
                  title: `TTS ${ttsEnabled ? 'disabled' : 'enabled'}`,
                  description: ttsEnabled ? 'Your messages will not be read aloud' : 'You can now hear your messages'
                });
                setTtsEnabled(!ttsEnabled);
              }
              else {
                showTTSDisabledToast();
              }
            }}
            className={`w-10 h-12 rounded-r-lg bg-background items-center justify-center hover:bg-surface`}
          >
            <Ionicons 
              name={ttsEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              className="!text-text"
            />
          </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ThemeProvider>
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
        </ThemeProvider>
      </Modal>
    </>
  );
}; 