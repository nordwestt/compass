import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAtom } from "jotai";
import { polarisServerAtom } from "@/src/hooks/atoms";
import PolarisServer from "@/src/services/polaris/PolarisServer";
import { toastService } from "@/src/services/toastService";
import { getProxyUrl } from "@/src/utils/proxy";
import { Modal } from "../ui/Modal";
import { polarisAuthTokenAtom } from "@/src/hooks/atoms";

interface MicrosoftAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  initialEndpoint?: string;
}

export function MicrosoftAuthModal({
  visible,
  onClose,
  onSuccess,
  initialEndpoint = "http://localhost:3000",
}: MicrosoftAuthModalProps) {
  const [polarisEndpoint, setPolarisEndpoint] = useState(initialEndpoint);
  const [polarisApiKey, setPolarisApiKey] = useState("");
  const [authUrl, setAuthUrl] = useState("");
  const [showWebView, setShowWebView] = useState(false);
  const [_, setPolarisServerInfo] = useAtom(polarisServerAtom);
  const [polarisAuthToken, setPolarisAuthToken] = useAtom(polarisAuthTokenAtom);
  useEffect(() => {
    if (visible) {
      setPolarisEndpoint(initialEndpoint);
      setPolarisApiKey("");
      setShowWebView(false);
    }
  }, [visible, initialEndpoint]);

  const handleApiKeyLogin = async () => {
    if (polarisEndpoint?.length === 0) {
      toastService.warning({ title: "Endpoint is required" });
      return;
    }

    if (polarisApiKey?.length === 0) {
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

    toastService.success({
      title: "Connected to Polaris",
      description: "Successfully connected using API key",
    });
    
    onSuccess(polarisApiKey);
    onClose();
  };

  const handleMicrosoftAuth = async () => {
    if (polarisEndpoint?.length === 0) {
      toastService.warning({ title: "Endpoint is required" });
      return;
    }

    try {
      // We need to include a redirect_uri parameter to tell the server where to redirect after auth
      const redirectUri = Platform.OS === "web" 
        ? `${window.location.origin}/auth-callback` 
        : "auth-callback"; // For mobile WebView
        
      const url = `${polarisEndpoint}/api/auth/microsoft?redirect_uri=${encodeURIComponent(redirectUri)}`;
      setAuthUrl(url);
      
      if (Platform.OS === "web") {
        // For web, open in a new window
        window.open(url, "_blank", "width=600,height=700");
        // We'll need to handle the callback in the main app
      } else {
        // For mobile, show WebView
        setShowWebView(true);
      }
    } catch (error) {
      console.error("Error starting Microsoft auth:", error);
      toastService.danger({
        title: "Authentication Error",
        description: "Failed to start Microsoft authentication",
      });
    }
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    // Check if the URL contains the auth callback
    if (navState.url.includes("/auth-callback?token=")) {
      console.log("Some URL", navState.url);
      // Extract token from URL
      const token = navState.url.split("token=")[1].split("&")[0];
      console.log("GOT token", token);
      
      if (token) {
        // Connect using the token
        if (await PolarisServer.connect(polarisEndpoint, token)) {
          setPolarisServerInfo({
            endpoint: polarisEndpoint,
            apiKey: token,
          });
          
          toastService.success({
            title: "Connected to Polaris",
            description: "Successfully authenticated with Microsoft",
          });
          
          setShowWebView(false);
          onSuccess(token);
          onClose();
        } else {
          toastService.danger({
            title: "Authentication Failed",
            description: "Could not connect with the provided token",
          });
          setShowWebView(false);
        }
      }
    }
  };

  // For web platforms, we need to listen for messages from the popup window
  useEffect(() => {
    if (Platform.OS === "web" && visible) {
      const handleMessage = (event: MessageEvent) => {
        console.log("Received message:", event.data);
        
        try {
          // Try to parse the data if it's a string
          const data = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;
            
          if (data.type === "auth-callback" && data.token) {
            console.log("Received token from popup:", data.token);
            setPolarisAuthToken(data.token);

            onSuccess(data.token);
            onClose();
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      console.log("Adding message event listener");
      window.addEventListener("message", handleMessage);
      return () => {
        console.log("Removing message event listener");
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [polarisEndpoint, visible]);

  return (
    <View>
        {!showWebView ? (
        <>
            <TouchableOpacity
                onPress={handleMicrosoftAuth}
                className="bg-[#2F2F2F] px-4 py-3 rounded-lg flex-row items-center justify-center flex-1 ml-2"
                disabled={!polarisEndpoint}
            >
                <Ionicons name="logo-microsoft" size={18} color="white" />
                <Text className="text-white ml-2 font-medium">Microsoft Login</Text>
            </TouchableOpacity>
        </>
        ) : (
        <View className="h-[400px] w-full">
            <WebView
            source={{ uri: authUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            />
        </View>
        )}
    </View>
  );
} 