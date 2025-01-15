import { Modal as RNModal, View, Text } from 'react-native';

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
}

export function Modal({ 
  isVisible, 
  onClose, 
  children,
  maxHeight = '70%'
}: ModalProps) {
  return (
    <RNModal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <ThemeProvider>
      <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute bg-black/50 flex-1 w-full h-full"
        ></Animated.View>
        <View className="flex-1 justify-end">
          <Animated.View 
            entering={SlideInDown.springify().damping(15)}
            exiting={SlideOutDown.duration(200)}
            className={`rounded-t-xl bg-background max-h-[70%]`}
          >
            {children}
          </Animated.View>
        </View>
      </ThemeProvider>
    </RNModal>
  );
} 