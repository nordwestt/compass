import React from "react";
import { Platform, View } from "react-native";
import { DocumentManager } from "@/src/components/documents/DocumentManager";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAtom } from "jotai";
import {
  documentsAtom,
  charactersAtom,
  currentIndexAtom,
  createDefaultThread,
  threadActionsAtom,
  userDocumentsAtom,
  polarisDocumentsAtom,
} from "@/src/hooks/atoms";
import { Document } from "@/src/types/core";
import { toastService } from "@/src/services/toastService";
import { router } from "expo-router";
import { DocumentPickerAsset } from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { PDFService } from "@/src/services/PDFService";
import { DocumentService } from "@/src/services/document/DocumentService";
import PolarisServer from "@/src/services/polaris/PolarisServer";

export default function Documents() {
  const [documents, setDocuments] = useAtom(polarisDocumentsAtom);
  const [characters, setCharacters] = useAtom(charactersAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
  const [, dispatchThread] = useAtom(threadActionsAtom);

  const onDocumentDelete = async (document: Document) => {
    const dependentCharacters = characters.filter((character) =>
      character.documentIds?.includes(document.id),
    );

    for (let character of dependentCharacters) {
      await PolarisServer.updateCharacter({
        ...character,
        documentIds: character.documentIds?.filter((id) => id !== document.id),
      });
    }

    setCharacters(await PolarisServer.getCharacters());
    await PolarisServer.deleteDocument(document.id);
    setDocuments(await PolarisServer.getDocuments());
    toastService.success({ title: "Document deleted successfully" });
  };

  const onDocumentUpload = async (file: DocumentPickerAsset) => {
    // FOR POLARIS
    // Create document object
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      path: file.uri,
      type: "pdf",
      pages: 0, // Will be updated after processing
    };

    // For web, we can get the file blob to send to server
    let fileBlob: Blob | undefined;
    if (Platform.OS === "web") {
      try {
        const response = await fetch(file.uri);
        fileBlob = await response.blob();
      } catch (error) {
        console.error("Failed to get file blob:", error);
      }
    }

    await PolarisServer.uploadDocument(newDoc, fileBlob);

    // pull the latest documents from the server
    const documents = await PolarisServer.getDocuments();
    setDocuments(documents);

    toastService.success({
      title: "Document processed",
      description: `Successfully processed the document`,
    });
  };

  const onStartDocumentChat = async (doc: Document) => {};

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <DocumentManager
          documents={documents}
          characters={characters}
          onDocumentDelete={onDocumentDelete}
          onDocumentUpload={onDocumentUpload}
          onStartDocumentChat={onStartDocumentChat}
        />
      </View>
    </SafeAreaView>
  );
}
