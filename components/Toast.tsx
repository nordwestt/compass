import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
import { toastService } from '@/services/toastService';
import { ToastMessage } from '@/types/toast';
import { Ionicons } from '@expo/vector-icons';

const getToastColor = (type: ToastMessage['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-red-500';
    case 'info':
      return 'bg-blue-500';
    case 'success':
      return 'bg-green-500';
    case 'danger':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getToastIcon = (type: ToastMessage['type']) => {
  switch (type) {
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
    case 'success':
      return 'checkmark-circle';
    case 'danger':
      return 'alert-circle';
    default:
      return 'information-circle';
  }
};

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        position: 'absolute' as any, // Type assertion to avoid TypeScript error
        left: 0,
        right: 0,
        zIndex: 50,
      },
      default: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 50,
      },
    }),
  },
});

export const Toast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastService.setUpdateCallback(setToasts);
    return () => toastService.setUpdateCallback(() => {});
  }, []);

  const ToastItem = ({ toast }: { toast: ToastMessage }) => {
    const { position = 'top', animationDuration = 300, slideOffset = 20 } = toast.options;

    const animatedStyle = useAnimatedStyle(() => {
      const translateY = position === 'top' ? -slideOffset : slideOffset;

      return {
        opacity: withTiming(1, { duration: animationDuration }),
        transform: [
          {
            translateY: withSequence(
              withSpring(translateY),
              withSpring(0)
            ),
          },
        ],
      };
    });

    const handleDismiss = () => {
      toastService.dismiss(toast.id);
    };

    return (
      <Animated.View style={[animatedStyle]} className="px-4 py-2 mb-2">
        <TouchableOpacity
          onPress={handleDismiss}
          className={`rounded-lg shadow-lg ${getToastColor(toast.type)} p-4 flex-row items-center`}
        >
          <Ionicons name={getToastIcon(toast.type)} size={24} color="white" />
          <View className="flex-1 ml-3">
            <Text className="text-white font-bold">{toast.title}</Text>
            {toast.description && (
              <Text className="text-white mt-1">{toast.description}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (toasts.length === 0) return null;

  const topToasts = toasts.filter(t => t.options.position !== 'bottom');
  const bottomToasts = toasts.filter(t => t.options.position === 'bottom');

  return (
    <View style={styles.container}>
      <View className="p-4">
        {topToasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
      <View className="absolute bottom-0 inset-x-0 p-4">
        {bottomToasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </View>
  );
}; 