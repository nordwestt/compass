export type ToastType = 'warning' | 'info' | 'success' | 'danger';
export type ToastPosition = 'top' | 'bottom';

export interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
  animationDuration?: number;
  slideOffset?: number;
  onDismiss?: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  options: ToastOptions;
}

export interface ToastServiceProps {
  warning: (message: Omit<ToastMessage, 'id' | 'type' | 'options'>, options?: ToastOptions) => void;
  info: (message: Omit<ToastMessage, 'id' | 'type' | 'options'>, options?: ToastOptions) => void;
  success: (message: Omit<ToastMessage, 'id' | 'type' | 'options'>, options?: ToastOptions) => void;
  danger: (message: Omit<ToastMessage, 'id' | 'type' | 'options'>, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
} 