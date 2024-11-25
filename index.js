// Add these polyfills at the very top of your index.js
import { polyfill } from 'react-native-polyfill-globals/src/fetch';
polyfill();

import { ReadableStream as ReadableStreamPolyfill } from 'web-streams-polyfill/dist/ponyfill';
// @ts-ignore
globalThis.ReadableStream = ReadableStreamPolyfill;

import 'text-encoding';

// Your existing app entry point
import 'expo-router/entry';