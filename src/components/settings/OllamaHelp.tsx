import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const OllamaHelp: React.FC = () => {
  return (
    <ScrollView className="flex-1">
      <View className="p-4 space-y-4">
        <Text className="text-xl font-bold text-foreground">Installing Ollama</Text>
        
        <Text className="text-foreground">
          Ollama is an open-source local server for hosting LLMs (large language models). 
          To use Ollama with this app, you'll need to:
        </Text>

        <View className="space-y-2">
          <Text className="font-bold text-foreground">1. Install Ollama</Text>
          <Text className="text-foreground">
            Visit https://ollama.com/ and follow the installation instructions for your platform.
          </Text>
        </View>

        <View className="space-y-2">
          <Text className="font-bold text-foreground">2. Configure Network Access</Text>
          
            <Text className="text-foreground">
              On macOS:
              {'\n'}1. Open Terminal
              {'\n'}2. Run: launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
              {'\n'}3. Run: ollama serve
            </Text>

           
            <View className="space-y-2">
              <Text className="text-foreground">
                On Windows:
                {'\n'}1. Open PowerShell and run:
                {'\n'}[System.Environment]::SetEnvironmentVariable('OLLAMA_HOST', '0.0.0.0:11434', 'User')
                {'\n'}2. Restart Ollama
              </Text>

              <Text className="text-foreground mt-2">
                On Linux:
                {'\n'}1. Edit the systemd service: systemctl edit ollama.service
                {'\n'}2. Add under [Service]: Environment="OLLAMA_HOST=0.0.0.0:11434"
                {'\n'}3. Run:
                {'\n'}sudo systemctl daemon-reload
                {'\n'}sudo systemctl restart ollama
              </Text>
            </View>
          
        </View>

        <View className="space-y-2">
          <Text className="font-bold text-foreground">3. Connect</Text>
          <Text className="text-foreground">
            Once Ollama is running and configured, use the "Scan for Ollama" button in the model selector 
            to connect to your Ollama instance.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}; 