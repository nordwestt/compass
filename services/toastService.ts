import { ToastMessage, ToastOptions, ToastType } from '@/types/toast';

let updateCallback: ((toasts: ToastMessage[]) => void) | null = null;
let toasts: ToastMessage[] = [];
const timeoutIds: { [key: string]: NodeJS.Timeout } = {};

const defaultOptions: ToastOptions = {
  position: 'top',
  duration: 3000,
  animationDuration: 300,
  slideOffset: 20,
};

export const toastService = {
  setUpdateCallback: (callback: (toasts: ToastMessage[]) => void) => {
    updateCallback = callback;
  },

  show: (type: ToastType, { title, description }: Pick<ToastMessage, 'title' | 'description'>, options?: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = {
      id,
      type,
      title,
      description,
      options: { ...defaultOptions, ...options },
    };

    toasts = [...toasts, toast];
    updateCallback?.(toasts);

    if (toast.options.duration !== Infinity) {
      timeoutIds[id] = setTimeout(() => {
        toastService.dismiss(id);
      }, toast.options.duration);
    }

    return id;
  },

  warning: (message: Pick<ToastMessage, 'title' | 'description'>, options?: ToastOptions) => 
    toastService.show('warning', message, options),

  info: (message: Pick<ToastMessage, 'title' | 'description'>, options?: ToastOptions) => 
    toastService.show('info', message, options),

  success: (message: Pick<ToastMessage, 'title' | 'description'>, options?: ToastOptions) => 
    toastService.show('success', message, options),

  danger: (message: Pick<ToastMessage, 'title' | 'description'>, options?: ToastOptions) => 
    toastService.show('danger', message, options),

  dismiss: (id: string) => {
    if (timeoutIds[id]) {
      clearTimeout(timeoutIds[id]);
      delete timeoutIds[id];
    }

    toasts = toasts.filter(toast => toast.id !== id);
    updateCallback?.(toasts);
  },

  dismissAll: () => {
    Object.keys(timeoutIds).forEach(id => {
      clearTimeout(timeoutIds[id]);
      delete timeoutIds[id];
    });

    toasts = [];
    updateCallback?.(toasts);
  },
}; 