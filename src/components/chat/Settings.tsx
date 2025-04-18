import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Model, Character, Thread } from "@/src/types/core";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import {
  availableProvidersAtom,
  availableModelsAtom,
  defaultModelAtom,
} from "@/src/hooks/atoms";
import { DropdownElement } from "@/src/components/ui/Dropdown";
import { Dropdown } from "@/src/components/ui/Dropdown";
import { toastService } from "@/src/services/toastService";
// Extend DropdownElement to include a model property
interface ModelDropdownElement extends DropdownElement {
  model: Model;
}

interface SettingsProps {
    thread: Thread;
    className?: string;
}

export const Settings: React.FC<SettingsProps> = ({
    thread,
  className,
}) => {

  const [defaultModel, setDefaultModel] = useAtom(defaultModelAtom);


  const availableSettings = [
    {
      title: "Set model as default",
      id: "set_model_as_default",
    },
  ];

  const handleSettingSelect = (el: DropdownElement)=>{
    if(el.id == "set_model_as_default"){
        setCurrentModelAsDefault();
    }
  };

  function setCurrentModelAsDefault() {
    if (thread.selectedModel) {
      setDefaultModel(thread.selectedModel);
      toastService.success({
        title: "Default model set",
        description: "The selected model will now be used for new threads",
      });
    }
  }

  return (
    <View className={`flex-row gap-2 items-center ${className}`}>
      <Dropdown
      iconOpen="ellipsis-horizontal"
      iconClosed="ellipsis-horizontal"
        showSearch={false}
        selected={null}
        onSelect={handleSettingSelect}
        children={availableSettings}
        className={`max-w-48 overflow-hidden`}
        position="right"
      />
    </View>
  );
};
