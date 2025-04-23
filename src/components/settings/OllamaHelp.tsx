import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '@/src/hooks/useLocalization';

export const OllamaHelp: React.FC = () => {
  const { t } = useLocalization();
  
  return (
    <ScrollView className="flex-1 mt-2">
      <View className="p-4 space-y-6">
        {/* Header */}
        <View className="flex-row items-center space-x-3">
          <Ionicons name="help-circle" size={32} className="!text-primary" />
          <Text className="text-2xl font-bold text-text">
            {t('settings.help.ollama.installing_ollama')}
          </Text>
        </View>

        {/* Introduction */}
        <Text className="text-text text-lg">
          {t('settings.help.ollama.introduction')}
        </Text>

        {/* Installation Section */}
        <View className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="download" size={24} className="!text-primary" />
            <Text className="text-xl font-bold text-text">
              {t('settings.help.ollama.install_ollama')}
            </Text>
          </View>
          <Text 
            className="text-text text-lg underline"
            onPress={() => Linking.openURL('https://ollama.com/')}
          >
            {t('settings.help.ollama.visit_ollama')}
          </Text>
          <Text className="text-secondary">
            {t('settings.help.ollama.follow_instructions')}
          </Text>
        </View>

        {/* Network Configuration Section */}
        <View className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="globe" size={24} className="!text-primary" />
            <Text className="text-xl font-bold text-text">
              {t('settings.help.ollama.configure_network')}
            </Text>
          </View>

          {/* macOS Instructions */}
          <View className="space-y-2">
            <Text className="font-bold text-text">macOS:</Text>
            <View className="bg-background p-3 rounded-lg">
              <Text className="text-text font-mono">
                1. Open Terminal{'\n'}
                2. Run: launchctl setenv OLLAMA_HOST "0.0.0.0:11434"{'\n'}
                3. Run: ollama serve
              </Text>
            </View>
          </View>

          {/* Windows Instructions */}
          <View className="space-y-2">
            <Text className="font-bold text-text">Windows:</Text>
            <View className="bg-background p-3 rounded-lg">
              <Text className="text-text font-mono">
                1. Open PowerShell and run:{'\n'}
                [System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User'){'\n'}
                2. Restart Ollama
              </Text>
            </View>
          </View>

          {/* Linux Instructions */}
          <View className="space-y-2">
            <Text className="font-bold text-text">Linux:</Text>
            <View className="bg-background p-3 rounded-lg">
              <Text className="text-text font-mono">
                1. Edit the systemd service: systemctl edit ollama.service{'\n'}
                2. Add under [Service]: Environment="OLLAMA_HOST=0.0.0.0:11434"{'\n'}
                3. Run:{'\n'}
                sudo systemctl daemon-reload{'\n'}
                sudo systemctl restart ollama
              </Text>
            </View>
          </View>
        </View>

        {/* Connection Section */}
        <View className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="link" size={24} className="!text-primary" />
            <Text className="text-xl font-bold text-text">
              {t('settings.help.ollama.connect')}
            </Text>
          </View>
          <Text className="text-text text-lg">
            {t('settings.help.ollama.connect_description')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}; 