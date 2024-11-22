import { Signal, signal } from '@preact/signals-react';

interface ModalConfig {
  title: string;
  message: string;
}

interface ModalState extends ModalConfig {
  isVisible: boolean;
  resolve: ((value: boolean) => void) | null;
}

const initialState: ModalState = {
  isVisible: false,
  title: '',
  message: '',
  resolve: null,
};

export const modalState = signal<ModalState>(initialState);

export const modalService = {
  confirm: (config: ModalConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      modalState.value = {
        ...config,
        isVisible: true,
        resolve,
      };
    });
  },
  
  handleResponse: (confirmed: boolean) => {
    if (modalState.value.resolve) {
      modalState.value.resolve(confirmed);
    }
    modalState.value = initialState;
  },
}; 