import React from 'react';
import { View } from 'react-native';
import { DocumentManager } from '@/src/components/documents/DocumentManager';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentsRoute() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <DocumentManager />
      </View>
    </SafeAreaView>
  );
} 