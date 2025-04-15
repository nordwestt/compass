import { View, ScrollView, Text, Pressable } from "react-native";
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
} from "@/src/hooks/atoms";
import { useAtom, useAtomValue } from "jotai";
import CharacterService from "@/src/services/character/CharacterService";
import ProviderService from "@/src/services/provider/ProviderService";
import { DocumentService } from "@/src/services/document/DocumentService";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [polarisExists, setPolarisExists] = useState(false);

  useEffect(() => {
    const tryConnect = async () => {
      const polarisProvider = userProviders.find((x) =>
        x.name?.toLowerCase()?.includes("polaris"),
      );

      if (polarisProvider) {
        setPolarisExists(true);
        await PolarisServer.connect(
          polarisProvider.endpoint,
          polarisProvider.apiKey ?? "",
        );

        setCharacters(await PolarisServer.getCharacters());
        setProviders(await PolarisServer.getProviders());
        setDocuments(await PolarisServer.getDocuments());
      }
    };
    tryConnect();
  }, [userProviders]);

  if (!polarisExists) {
    return (
      <View>
        <Text>Sorry, it's not connected :(</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4 flex-col border-4 border-primary m-2 rounded-lg">
      <View className="flex-row">
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
      <View className="flex-1">
        {currentIndex === 0 && <AdminCharactersPanel />}
        {currentIndex === 1 && <Documents />}
        {currentIndex === 2 && <Providers />}
      </View>
    </View>
  );
}
