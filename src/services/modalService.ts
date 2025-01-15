interface ModalState {
  isVisible: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  type: 'confirm' | 'prompt';
}

export const modalState = {
  isVisible: false,
  title: '',
  message: '',
  type: 'confirm' as const
};

let resolveModal: ((value: any) => void) | null = null;
let modalUpdateCallback: ((state: ModalState) => void) | null = null;

export const modalService = {
  setUpdateCallback: (callback: (state: ModalState) => void) => {
    modalUpdateCallback = callback;
  },

  confirm: ({ title, message }: { title: string; message: string }) => {
    if (modalUpdateCallback) {
      modalUpdateCallback({
        isVisible: true,
        title,
        message,
        type: 'confirm'
      });
    }
    return new Promise<boolean>((resolve) => {
      resolveModal = resolve;
    });
  },

  prompt: ({ title, message, defaultValue }: { title: string; message: string; defaultValue?: string }) => {
    if (modalUpdateCallback) {
      modalUpdateCallback({
        isVisible: true,
        title,
        message,
        defaultValue,
        type: 'prompt'
      });
    }
    return new Promise<string | null>((resolve) => {
      resolveModal = resolve;
    });
  },

  handleResponse: (response: boolean | string | null) => {
    if (modalUpdateCallback) {
      modalUpdateCallback({ 
        isVisible: false, 
        title: '', 
        message: '', 
        type: 'confirm' 
      });
    }
    if (resolveModal) {
      resolveModal(response);
      resolveModal = null;
    }
  }
}; 