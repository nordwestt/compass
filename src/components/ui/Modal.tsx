import { View, Text, Platform } from 'react-native';
import RNModal from 'react-native-modal';

import { ThemeProvider } from '@/src/components/ui/ThemeProvider';
import Animated, { 
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Optional maximum height for the modal content.
   * Defaults to 70% of screen height.
   */
  maxHeight?: string;
  className?: string;
  /**
   * Position of the modal on the screen
   * @default 'bottom'
   */
  position?: 'bottom' | 'center';
}

export function Modal({ 
  isVisible, 
  onClose, 
  children,
  maxHeight = '70%',
  className,
  position = Platform.OS === 'web' ? 'center' : 'bottom'
}: ModalProps) {
  return (
    <RNModal
      isVisible={isVisible}
      onModalHide={onClose}
      style={{
        margin: 0,
        justifyContent: position === 'center' ? 'center' : 'flex-end'
      }}
    >
      <ThemeProvider>
        <View 
          className={`
            ${position === 'bottom' ? 'justify-end' : 'justify-center'} 
            flex-1
          `}
        >
          <View 
            className={`
              ${position === 'center' ? 'w-3/4 my-auto mx-auto' : 'w-full'}
              ${position === 'bottom' ? 'rounded-t-xl' : 'rounded-xl'} 
              bg-background 
              ${className}
            `}
          >
            {children}
          </View>
        </View>
      </ThemeProvider>
    </RNModal>
  );
} 