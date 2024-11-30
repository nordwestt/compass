import { Platform } from 'react-native';
import { Audio, AVPlaybackSource } from 'expo-av';

export interface TTSOptions {
  apiKey: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface TTSStreamHandler {
  onStart?: () => void;
  onAudioReady?: (audioChunks: Uint8Array) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

class TTSService {
  private static instance: TTSService;
  private websocket: WebSocket | null = null;
  private currentHandler: TTSStreamHandler | null = null;
  private isPlaying = false;
  private isWeb: boolean;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private messageQueue: { text: string; options: TTSOptions }[] = [];
  private currentOptions: TTSOptions | null = null;
  private isProcessingQueue = false;
  private audioQueue: Uint8Array[] = [];
  private isProcessingAudio = false;
  private nextAudioTime = 0;
  private constructor() {
    this.isWeb = Platform.OS === 'web';
    
    if (this.isWeb && typeof window !== 'undefined') {
      this.initializeAudio();
    }
  }

  private async playSoundArray(soundArray: Uint8Array) :Promise<void> {
    console.log('Loading Sound');
    if(this.isWeb){

        return new Promise(async (resolve, reject) => {
            // create a blob url from the audio chunk
            const audioBlob = new Blob([soundArray], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(audioBlob);

            // create AVPlaybackSource from the url
            const source: AVPlaybackSource = { uri: url };
            const { sound } = await Audio.Sound.createAsync(source);
            
            // Set up playback status handler
            sound.setOnPlaybackStatusUpdate((status) => {
                if(status.isLoaded && status.isPlaying){
                    if(status.durationMillis && status.positionMillis){
                        this.nextAudioTime = new Date().getTime() + (status.durationMillis - status.positionMillis) - 100;
                    } else{
                        // set max time to ensure await finished before where duration is not available
                        this.nextAudioTime = new Date().getTime() + 999999;
                    }
                }
                
                if (status.isLoaded &&status.didJustFinish) {
                    sound.unloadAsync(); // Clean up
                    URL.revokeObjectURL(url); // Clean up blob URL
                    resolve();
                }
            });

            console.log('Playing Sound');
            await sound.playAsync();
        });
    }
    else{
      throw new Error('TTS is not supported on this platform');
    }
  }

  async processAudioQueue() {
    if (this.isProcessingAudio || this.audioQueue.length === 0) {
      return;
    }

    this.isProcessingAudio = true;
    try {
      while (this.audioQueue.length > 0) {
        const soundArray = this.audioQueue.shift()!;
        await this.playSoundArray(soundArray);
      }
    } catch (error) {
      console.error('Error processing audio queue:', error);
      this.currentHandler?.onError?.(error as Error);
    } finally {
      //this.isPlaying = false;
      this.isProcessingAudio = false;
    }
  }

  private async initializeAudio() {
    
  }

  private async processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const { text, options } = this.messageQueue.shift()!;

    try {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        await this.ensureWebSocketConnection(options);
      }

      const config = {
        text: text,
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.8,
          style: options.style || 0,
          use_speaker_boost: options.useSpeakerBoost || true
        },
        xi_api_key: options.apiKey
      };

      this.websocket?.send(JSON.stringify(config));
    } catch (error) {
      console.error('Error processing message queue:', error);
      this.currentHandler?.onError?.(error as Error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  

  private async queueAudio(audioChunks: Uint8Array) {
    if (audioChunks.length === 0) {
      return;
    }

    try {
      this.audioQueue.push(audioChunks);
      this.currentHandler?.onAudioReady?.(audioChunks);
      
      // Start processing the queue if it's not already running
      if (!this.isProcessingAudio) {
        await this.processAudioQueue();
      }
    } catch (error) {
      console.error('Error preparing audio:', error);
      this.currentHandler?.onError?.(error as Error);
    }
  }

  private setupMessageHandler() {
    if (!this.websocket) return;
    console.log('Setting up message handler');
    this.websocket.onmessage = async (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('Received response:', response);
        
        if (response.audio) {
          const audioData = atob(response.audio);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }

          this.queueAudio(audioArray);
        }
      } catch (error) {
        console.error('Error processing audio chunk:', error);
        this.currentHandler?.onError?.(error as Error);
      }
    };
  }

  async streamText(text: string, options: TTSOptions, handler: TTSStreamHandler) {
    if (!options.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    if (!this.isWeb) {
      handler.onError?.(new Error('WebSocket TTS is only supported on web platform'));
      return;
    }

    this.currentHandler = handler;
    this.messageQueue.push({ text, options });
    this.currentHandler?.onStart?.();
    
    if (!this.isProcessingQueue) {
      await this.processMessageQueue();
    }
  }

  stop() {

    this.audioQueue = []; // Clear the audio queue
    this.messageQueue = [];
    this.isPlaying = false;
    console.log('stop was CALLED');
    this.isProcessingQueue = false;
    this.isProcessingAudio = false;
  }

  private async ensureWebSocketConnection(options: TTSOptions): Promise<void> {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.isConnecting) {
      return await this.connectionPromise ?? Promise.resolve();
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2/stream-input?model_id=eleven_turbo_v2`;
      
      try {
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          this.isConnecting = false;
          this.currentOptions = options;
          console.log('WebSocket connection opened');
          resolve();
        };

        this.websocket.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket connection error:', error);
          reject(error);
        };

        this.websocket.onclose = () => {
          this.isConnecting = false;
          this.websocket = null;
          this.currentHandler?.onFinish?.();
          console.log('WebSocket connection closed');
          
          // Try to process any remaining messages
          if (this.messageQueue.length > 0) {
            this.processMessageQueue();
          }
        };

        this.setupMessageHandler();
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }
}

export const ttsService = TTSService.getInstance(); 