import React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAtom } from 'jotai';
import { proxyUrlAtom } from '@/src/hooks/atoms';
import { toastService } from '@/src/services/toastService';

export function ProxySettings() {
  const [proxyUrl, setProxyUrl] = useAtom(proxyUrlAtom);
  const [tempProxyUrl, setTempProxyUrl] = useState(proxyUrl);

  const handleSave = () => {
    setProxyUrl(tempProxyUrl);
    toastService.success({
      title: 'Proxy URL saved',
      description: 'Proxy URL saved successfully',
    });
  };

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-text">Proxy Settings</Text>
      <View className="space-y-2">
        <Text className="text-sm text-secondary">Proxy URL</Text>
        <TextInput
          className="bg-surface p-2 rounded-lg border border-border text-text"
          value={tempProxyUrl}
          onChangeText={setTempProxyUrl}
          placeholder="Enter proxy URL"
          placeholderTextColor="#666"
        />
        <Text className="text-xs text-secondary">
          Used for web and desktop platforms to bypass CORS restrictions
        </Text>
        <Pressable 
          className="bg-primary p-3 rounded-lg mt-2" 
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">Save</Text>
        </Pressable>
      </View>
    </View>
  );
} 