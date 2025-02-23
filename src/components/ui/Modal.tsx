import { View, Text } from 'react-native';
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
}

export function Modal({ 
  isVisible, 
  onClose, 
  children,
  maxHeight = '70%',
  className
}: ModalProps) {
  return (
    <RNModal
      isVisible={isVisible}
      onModalHide={onClose}
      style={{margin:0}}
    >
      <ThemeProvider>
        <View className="flex-1 justify-end">
          <View className={`rounded-t-xl bg-background max-h-[70%] ${className}`}>
            {children}
          </View>
        </View>
      </ThemeProvider>
    </RNModal>
  );
} 