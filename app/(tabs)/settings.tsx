import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";
import { syncToPolarisAtom } from "@/src/hooks/atoms";
import { useAtom } from "jotai";
import { useLocalization } from "@/src/hooks/useLocalization";
interface SettingItemProps {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  className?: string;
}

const SettingItem = ({
  title,
  description,
  icon,
  onPress,
  className,
}: SettingItemProps) => (
  <TouchableOpacity
    className={`flex-row items-center h-32 p-4 mb-2 bg-surface rounded-lg border border-border hover:bg-background hover:shadow-md ${className}`}
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
  const [syncToPolaris, setSyncToPolaris] = useAtom(syncToPolarisAtom);
  const { t } = useLocalization();

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-6">
        <View className="flex-row items-center p-4">
          <Ionicons name="cog" size={32} className="!text-primary mr-2 pb-2" />
          <Text className="text-2xl font-bold text-primary">{t('settings.settings')}</Text>
        </View>
        <Text className="text-secondary">Customize your chat experience</Text>
      </View>

      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
        <SettingItem
          title="Font Settings"
          description="Customize text appearance and size"
          icon="text"
          onPress={() => router.push("/settings/font")}
        />

        <SettingItem
          title="Providers"
          description="Manage your AI model providers"
          icon="server"
          onPress={() => router.push("/settings/providers")}
        />

        {!syncToPolaris && (
          <SettingItem
            title="Theme"
            description="Choose your preferred color scheme"
            icon="color-palette"
            onPress={() => router.push("/settings/theme")}
          />
        )}

        <SettingItem
          title="Logs"
          description="View application logs"
          icon="list"
          onPress={() => router.push("/settings/logs")}
        />

        <SettingItem
          title="General"
          description="General settings"
          icon="settings"
          onPress={() => router.push("/settings/general")}
        />

        <SettingItem
          title="Data Export"
          description="Download or backup your conversation history"
          icon="download"
          onPress={() => router.push("/settings/export")}
        />

        <SettingItem
          title="Help"
          description="Install and configure ollama"
          icon="help-circle"
          onPress={() => router.push("/settings/help")}
        />

        <SettingItem
          title="Polaris"
          description="Manage your Polaris server"
          icon="sparkles"
          onPress={() => router.push("/settings/polaris")}
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
