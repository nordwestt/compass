import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { modalService } from '@/services/modalService';

interface ModalState {
  isVisible: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  type: 'confirm' | 'prompt';
}

export const ConfirmationModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isVisible: false,
    title: '',
    message: '',
    type: 'confirm'
  });
  const [inputText, setInputText] = useState('');
  
  useEffect(() => {
    modalService.setUpdateCallback(setModalState);
    return () => modalService.setUpdateCallback(() => {});
  }, []);

  useEffect(() => {
    if (modalState.isVisible && modalState.type === 'prompt') {
      setInputText(modalState.defaultValue || '');
    }
  }, [modalState.isVisible]);

  const Content = () => (
    <View className="bg-background rounded-lg p-6 m-4 max-w-sm w-full">
      <Text className="text-xl font-bold mb-2 text-black dark:text-white">
        {modalState.title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        {modalState.message}
      </Text>

      {modalState.type === 'prompt' && (
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-4 text-black dark:text-white"
          autoFocus={true}
          blurOnSubmit={false}
          multiline={false}
          returnKeyType="done"
          onSubmitEditing={() => modalService.handleResponse(inputText)}
        />
      )}

      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={() => modalService.handleResponse(null)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          <Text className="text-black dark:text-white">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => modalService.handleResponse(
            modalState.type === 'prompt' ? inputText : true
          )}
          className="px-4 py-2 rounded-lg bg-primary"
        >
          <Text className="text-white">
            {modalState.type === 'prompt' ? 'Save' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!modalState.isVisible) return null;
    return (
      <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <Content />
      </View>
    );
  }

  return (
    <Modal
      visible={modalState.isVisible}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
        <Content />
      </View>
    </Modal>
  );
}; 