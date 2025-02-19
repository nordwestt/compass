import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useAtom } from 'jotai';
import { proxyUrlAtom } from '@/src/hooks/atoms';

export function ProxySettings() {
  const [proxyUrl, setProxyUrl] = useAtom(proxyUrlAtom);

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-foreground">Proxy Settings</Text>
      <View className="space-y-2">
        <Text className="text-sm text-secondary">Proxy URL</Text>
        <TextInput
          className="bg-surface p-2 rounded-lg border border-border text-foreground"
          value={proxyUrl}
          onChangeText={setProxyUrl}
          placeholder="Enter proxy URL"
          placeholderTextColor="#666"
        />
        <Text className="text-xs text-secondary">
          Used for web and desktop platforms to bypass CORS restrictions
        </Text>
      </View>
    </View>
  );
} 