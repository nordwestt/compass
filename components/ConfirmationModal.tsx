import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { modalState, modalService } from '@/services/modalService';
import { useSignals } from '@preact/signals-react/runtime';

export const ConfirmationModal = () => {
  useSignals();
  const [inputText, setInputText] = useState('');
  
  // Update local state when modal opens with new defaultValue
  useEffect(() => {
    if (modalState.value.isVisible && modalState.value.type === 'prompt') {
      setInputText(modalState.value.defaultValue || '');
    }
  }, [modalState.value.isVisible]);

  const Content = () => (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full">
      <Text className="text-xl font-bold mb-2 text-black dark:text-white">
        {modalState.value.title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-300 mb-4">
        {modalState.value.message}
      </Text>

      {modalState.value.type === 'prompt' && (
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
            modalState.value.type === 'prompt' ? inputText : true
          )}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white">
            {modalState.value.type === 'prompt' ? 'Save' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!modalState.value.isVisible) return null;
    return (
      <View className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <Content />
      </View>
    );
  }

  return (
    <Modal
      visible={modalState.value.isVisible}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
        <Content />
      </View>
    </Modal>
  );
}; 