import React from 'react';
import { View, Text, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const OllamaHelp: React.FC = () => {
  return (
    <ScrollView className="flex-1 mt-2">
      <View className="p-4 space-y-6">
        {/* Header */}
        <View className="flex-row items-center space-x-3">
          <Ionicons name="help-circle" size={32} className="!text-primary" />
          <Text className="text-2xl font-bold text-text">Installing Ollama</Text>
        </View>

        {/* Introduction */}
        <Text className="text-text text-lg">
          Ollama is an open-source local server for hosting LLMs (large language models). 
          To use Ollama with this app, follow these steps:
        </Text>

        {/* Installation Section */}
        <View className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="download" size={24} className="!text-primary" />
            <Text className="text-xl font-bold text-text">1. Install Ollama</Text>
          </View>
          <Text 
            className="text-text text-lg underline"
            onPress={() => Linking.openURL('https://ollama.com/')}
          >
            Visit ollama.com
          </Text>
          <Text className="text-secondary">
            Follow the installation instructions for your platform.
          </Text>
        </View>

        {/* Network Configuration Section */}
        <View className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <View className="flex-row items-center space-x-2">
            <Ionicons name="globe" size={24} className="!text-primary" />
            <Text className="text-xl font-bold text-text">2. Configure Network Access</Text>
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
            <Text className="text-xl font-bold text-text">3. Connect</Text>
          </View>
          <Text className="text-text text-lg">
            Once Ollama is running and configured, use the "Scan for Ollama" button in the model selector 
            to connect to your Ollama instance.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}; 