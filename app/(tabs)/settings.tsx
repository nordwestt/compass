import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

interface SettingItemProps {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}

const SettingItem = ({ title, description, icon, onPress }: SettingItemProps) => (
  <TouchableOpacity 
    className="flex-row items-center p-4 mb-2 bg-surface rounded-lg border border-border hover:bg-background hover:shadow-md"
    onPress={onPress}
  >
    <View className="bg-primary/10 p-3 rounded-full mr-4">
      <Ionicons name={icon} size={24} className="!text-primary" />
    </View>
    <View className="flex-1">
      <Text className="text-lg font-semibold text-text mb-1">{title}</Text>
      <Text className="text-secondary text-sm">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} className="!text-secondary" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-6">
        <View className="flex-row items-center p-4">
          <Ionicons name="cog" size={32} className="!text-primary mr-2 pb-2" />
          <Text className="text-2xl font-bold text-primary">
              Settings
          </Text>
        </View>
        <Text className="text-secondary">Customize your chat experience</Text>
      </View>

      <View className="space-y-4">
        <SettingItem
          title="Font Settings"
          description="Customize text appearance and size"
          icon="text"
          onPress={() => router.push('/settings/font')}
        />

        <SettingItem
          title="API Providers"
          description="Manage your AI model providers"
          icon="server"
          onPress={() => router.push('/settings/providers')}
        />

        <SettingItem
          title="Theme"
          description="Choose your preferred color scheme"
          icon="color-palette"
          onPress={() => router.push('/settings/theme')}
        />

        <SettingItem
          title="Logs"
          description="View application logs"
          icon="list"
          onPress={() => router.push('/settings/logs')}
        />

        <SettingItem
          title="General"
          description="General settings"
          icon="settings"
          onPress={() => router.push('/settings/general')}
        />

        <SettingItem
          title="Help"
          description="Install and configure ollama"
          icon="help-circle"
          onPress={() => router.push('/settings/help')}
        />

        {/* <SettingItem
          title="About"
          description="Version information and credits"
          icon="information-circle"
          onPress={() => router.push('/settings/about')}
        /> */}
      </View>
    </ScrollView>
  );
}
