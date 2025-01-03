import { ImageProvider } from '@/src/types/image';
import { Model } from '@/types/core';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ReplicateProvider implements ImageProvider {
    async generateImage(prompt: string, model: Model, signal?: AbortSignal): Promise<string> {
        try {
            let url = `${model.provider.endpoint}/v1/models/${model.id}/predictions`;
            if(Platform.OS === 'web' && false) {
                url = url.replace('https://api.replicate.com', 'http://localhost:8010/proxy');
            }

            const createResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${model.provider.apiKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'wait'
                },
                body: JSON.stringify({
                    input: {
                        "aspect_ratio": "1:1",
                        "go_fast": true,
                        "megapixels": "1",
                        "num_inference_steps": 4,
                        "num_outputs": 1,
                        "output_format": "webp",
                        "output_quality": 80,
                        "prompt": prompt
                    }
                }),
                signal
            });
            
            if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`);
            }
            
            const responseData = await createResponse.json();
            let predictionUrl = responseData.urls.get;
            if(Platform.OS === 'web' && false) {
                predictionUrl = predictionUrl.replace('https://api.replicate.com', 'http://localhost:8010/proxy');
            }

            // Poll for completion
            while (true) {
                const statusResponse = await fetch(
                    predictionUrl,
                    {
                        headers: {
                            'Authorization': `Token ${model.provider.apiKey}`
                        },
                        signal
                    }
                );

                const prediction = await statusResponse.json();

                if (prediction.status === 'succeeded') {
                    const imageUrl = prediction.output[0];

                    if(Platform.OS === 'web') {
                        return imageUrl;
                    }
                    
                    // Create a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const fileUri = `${FileSystem.documentDirectory}generated_${timestamp}.webp`;

                    // Download and save the image
                    const downloadResult = await FileSystem.downloadAsync(
                        imageUrl,
                        fileUri
                    );

                    if (downloadResult.status !== 200) {
                        throw new Error('Failed to download image');
                    }

                    const imageData = {
                        id: timestamp.toString(),
                        prompt,
                        imagePath: fileUri,
                        createdAt: new Date().toISOString()
                    };

                    // Get the current images and add the new one
                    const currentImages = await AsyncStorage.getItem('generatedImages');
                    const images = currentImages ? JSON.parse(currentImages) : [];
                    images.push(imageData);
                    await AsyncStorage.setItem('generatedImages', JSON.stringify(images));

                    return fileUri;
                }

                if (prediction.status === 'failed') {
                    throw new Error('Image generation failed: ' + prediction.error);
                }

                // Wait before polling again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Image generation was cancelled');
            }
            throw new Error(`Failed to generate image: ${error.message}`);
        }
    }
}