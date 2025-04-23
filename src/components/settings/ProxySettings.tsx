import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAtom } from 'jotai';
import { toastService } from '@/src/services/toastService';
import { proxyUrlAtom } from '@/src/hooks/atoms';
import { useLocalization } from '@/src/hooks/useLocalization';

export function ProxySettings() {
  const { t } = useLocalization();
  const [proxyUrl, setProxyUrl] = useAtom(proxyUrlAtom);
  const [tempProxyUrl, setTempProxyUrl] = useState(proxyUrl);

  useEffect(() => {
    setTempProxyUrl(proxyUrl);
  }, [proxyUrl]);

  const handleSave = () => {
    setProxyUrl(tempProxyUrl);
    toastService.success({
      title: t('settings.proxy.saved'),
      description: t('settings.proxy.saved_description'),
    });
  };

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-text">{t('settings.proxy.title')}</Text>
      <View className="space-y-2">
        <Text className="text-sm text-secondary">{t('settings.proxy.proxy_url')}</Text>
        <TextInput
          className="bg-surface p-2 rounded-lg border border-border text-text"
          value={tempProxyUrl}
          onChangeText={setTempProxyUrl}
          placeholder={t('settings.proxy.enter_proxy_url')}
          placeholderTextColor="#666"
        />
        <Text className="text-xs text-secondary">
          {t('settings.proxy.description')}
        </Text>
        <Pressable 
          className="bg-primary p-3 rounded-lg mt-2" 
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">{t('common.save')}</Text>
        </Pressable>
      </View>
    </View>
  );
} 