// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Platform } from "react-native";
import TextEncoder from "react-native-fast-encoder";

if (Platform.OS !== "web") {
  const setupPolyfills = async () => {
    const { polyfillGlobal } = await import(
      "react-native/Libraries/Utilities/PolyfillFunctions"
    );
    const { ReadableStream, TransformStream } = await import(
      "web-streams-polyfill/dist/ponyfill"
    );

    polyfillGlobal("TextDecoder", () => TextEncoder);
    polyfillGlobal("ReadableStream", () => ReadableStream);
    polyfillGlobal("TransformStream", () => TransformStream);
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
    
  };

  setupPolyfills();
}

// Your existing app entry point
import 'expo-router/entry';
