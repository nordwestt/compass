import { signal } from "@preact/signals-react";

interface ModalState {
  isVisible: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  type: 'confirm' | 'prompt';
}

export const modalState = signal<ModalState>({
  isVisible: false,
  title: '',
  message: '',
  type: 'confirm'
});

let resolveModal: ((value: any) => void) | null = null;

export const modalService = {
  confirm: ({ title, message }: { title: string; message: string }) => {
    modalState.value = {
      isVisible: true,
      title,
      message,
      type: 'confirm'
    };
    return new Promise<boolean>((resolve) => {
      resolveModal = resolve;
    });
  },

  prompt: ({ title, message, defaultValue }: { title: string; message: string; defaultValue?: string }) => {
    modalState.value = {
      isVisible: true,
      title,
      message,
      defaultValue,
      type: 'prompt'
    };
    return new Promise<string | null>((resolve) => {
      resolveModal = resolve;
    });
  },

  handleResponse: (response: boolean | string | null) => {
    modalState.value = { ...modalState.value, isVisible: false };
    if (resolveModal) {
      resolveModal(response);
      resolveModal = null;
    }
  }
}; 