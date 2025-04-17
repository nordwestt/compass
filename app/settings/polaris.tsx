import {
  View,
  ScrollView,
  Text,
  Pressable,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import AdminCharactersPanel from "@/src/components/polaris/characters";
import { Character } from "@/src/types/core";
import Documents from "@/src/components/polaris/documents";
import Providers from "@/src/components/polaris/providers";
import PolarisServer from "@/src/services/polaris/PolarisServer";
import {
  userProvidersAtom,
  polarisCharactersAtom,
  polarisDocumentsAtom,
  polarisProvidersAtom,
  polarisServerAtom,
} from "@/src/hooks/atoms";
import { useAtom, useAtomValue } from "jotai";
import CharacterService from "@/src/services/character/CharacterService";
import ProviderService from "@/src/services/provider/ProviderService";
import { DocumentService } from "@/src/services/document/DocumentService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { toastService } from "@/src/services/toastService";

export default function PolarisSettingScreen() {
  const routes = [
    { key: "characters", title: "Characters", icon: "people" },
    { key: "documents", title: "Documents", icon: "document-text" },
    { key: "providers", title: "Providers", icon: "server" },
  ];
  const userProviders = useAtomValue(userProvidersAtom);

  const [characters, setCharacters] = useAtom(polarisCharactersAtom);
  const [providers, setProviders] = useAtom(polarisProvidersAtom);
  const [documents, setDocuments] = useAtom(polarisDocumentsAtom);
  const [polarisServerInfo, setPolarisServerInfo] = useAtom(polarisServerAtom);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [polarisEndpoint, setPolarisEndpoint] = useState(
    "http://localhost:3000",
  );
  const [polarisApiKey, setPolarisApiKey] = useState("");

  useEffect(() => {
    if (polarisServerInfo) {
      loadResources();
    }
  }, []);

  const loadResources = async () => {
    setCharacters(await PolarisServer.getCharacters());
    setProviders(await PolarisServer.getProviders());
    setDocuments(await PolarisServer.getDocuments());
  };

  const onPolarisLogin = async () => {
    if (polarisEndpoint?.length == 0) {
      toastService.warning({ title: "Endpoint is required" });
      return;
    }

    if (polarisApiKey?.length == 0) {
      toastService.warning({ title: "API Key is required" });
      return;
    }

    if (!(await PolarisServer.connect(polarisEndpoint, polarisApiKey))) {
      toastService.danger({ title: "Failed to connect to Polaris" });
      return;
    }

    setPolarisServerInfo({
      endpoint: polarisEndpoint,
      apiKey: polarisApiKey,
    });

    await loadResources();
  };

  const onPolarisLogout = async () => {
    setPolarisServerInfo(null);
    setCharacters([]);
    setProviders([]);
    setDocuments([]);
  };

  if (!polarisServerInfo) {
    return (
      <View className="flex-1 items-center justify-center p-2">
        <View className="mt-4 border-2 border-border p-4 rounded-lg bg-surface">
          <Text className="font-bold mb-2 ml-2">✨ Polaris</Text>
          <TextInput
            className="border border-border flex-1 h-[40px] py-2 rounded-lg px-4 bg-surface text-text"
            placeholder="Endpoint URL"
            onChangeText={(url: string) => setPolarisEndpoint(url)}
            value={polarisEndpoint}
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          <TextInput
            className="mt-2 border border-border flex-1 h-[40px] py-2 rounded-lg px-4 bg-surface text-text"
            placeholder="API Key"
            onChangeText={(apiKey) => setPolarisApiKey(apiKey)}
            value={polarisApiKey}
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
            secureTextEntry
          />
          <TouchableOpacity
            className="flex-row items-center gap-2 bg-primary hover:opacity-80 rounded-lg p-4 border border-border mt-2"
            onPress={() => {
              onPolarisLogin();
            }}
          >
            <Ionicons name="log-in" size={16} color="white" className="mr-2" />
            <Text className="text-white flex-1">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background flex-col border-4 border-primary m-2 rounded-lg">
      <View className="flex-row w-full">
        <View className="flex-row w-1/3">
          {routes.map((route: any, index: number) => (
            <Pressable
              key={route.key}
              onPress={() => {
                setCurrentIndex(index);
              }}
              className={`group-hover:w-32 z-20 w-14 transition-all duration-200 flex-row items-center justify-between p-4 m-2 rounded-lg hover:bg-surface ${
                currentIndex === index
                  ? "border-r border-primary border shadow-sm bg-surface"
                  : ""
              }`}
            >
              <TabBarIcon
                name={route.icon as any}
                size={22}
                className={`w-12 ${currentIndex === index ? "!text-primary" : "!text-secondary"}`}
              />
              <Text
                className={`text-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  currentIndex === index ? "text-primary" : "text-secondary"
                }`}
              >
                {route.title}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="w-1/3">
          <View className="mx-auto text-center w-32 bg-primary text-white p-2 rounded-b-lg font-bold flex-row justify-center">
            <Text className="text-surface my-auto font-bold">✨ Polaris</Text>
            <Pressable className="ml-auto" onPress={onPolarisLogout}>
              <Ionicons name="log-out" size={22} className="!text-surface" />
            </Pressable>
          </View>
        </View>
        <View className="w-1/3"></View>
      </View>
      <View className="flex-1">
        {currentIndex === 0 && <AdminCharactersPanel />}
        {currentIndex === 1 && <Documents />}
        {currentIndex === 2 && <Providers />}
      </View>
    </View>
  );
}
