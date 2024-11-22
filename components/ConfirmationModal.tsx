import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { modalState, modalService } from '@/services/modalService';
import { useSignal } from '@preact/signals-react';

export const ConfirmationModal = () => {
  const inputText = useSignal(modalState.value.defaultValue || '');

  const Content = () => (
    <View className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
      <Text className="text-xl font-bold mb-2">{modalState.value.title}</Text>
      <Text className="text-gray-600 mb-4">{modalState.value.message}</Text>

      {modalState.value.type === 'prompt' && (
        <TextInput
          value={inputText.value}
          onChangeText={(text) => inputText.value = text}
          className="border border-gray-300 rounded-lg p-2 mb-4"
          defaultValue={modalState.value.defaultValue}
        />
      )}

      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={() => modalService.handleResponse(null)}
          className="px-4 py-2 rounded-lg bg-gray-200"
        >
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => modalService.handleResponse(
            modalState.value.type === 'prompt' ? inputText.value : true
          )}
          className="px-4 py-2 rounded-lg bg-blue-500"
        >
          <Text className="text-white">{modalState.value.type === 'prompt' ? 'Save' : 'Confirm'}</Text>
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