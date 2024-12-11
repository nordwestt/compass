// Add these polyfills at the very top of your index.js
// import { polyfill } from 'react-native-polyfill-globals/src/fetch';
// polyfill();

import { ReadableStream as ReadableStreamPolyfill } from 'web-streams-polyfill/dist/ponyfill';
// // @ts-ignore

import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';

import { Platform } from 'react-native';
import 'text-encoding';
globalThis.ReadableStream = ReadableStreamPolyfill;

if(Platform.OS !== 'web') {
    
    polyfillFetch();
}

// Your existing app entry point
import 'expo-router/entry';