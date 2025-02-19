import { ImageProvider } from '@/src/types/image';
import { Model } from '@/src/types/core';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { open, SeekMode, BaseDirectory } from '@tauri-apps/plugin-fs';
import { getProxyUrl } from '@/src/utils/proxy';

function isTauri(){
    return typeof window !== 'undefined' && !!(window as any).__TAURI__;
}

export class ReplicateProvider implements ImageProvider {
    async generateImage(prompt: string, model: Model, signal?: AbortSignal): Promise<string> {
        try {
            let url = `${model.provider.endpoint}/v1/models/${model.id}/predictions`;
            if(isTauri() || Platform.OS == 'web') {
                url = await getProxyUrl(url);
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
            if(isTauri() || Platform.OS === 'web') {
                predictionUrl = await getProxyUrl(predictionUrl);
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
                    let imageUrl = prediction.output[0];

                    if(isTauri()) {
                        imageUrl = await getProxyUrl(imageUrl);
                        // Create a unique filename using timestamp
                        const timestamp = new Date().getTime();
                        const fileUri = `generated_${timestamp}.webp`;

                        const file = await open(fileUri, { write: true, truncate: true, create: true, baseDir: BaseDirectory.Picture });
                        
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const arrayBuffer = await blob.arrayBuffer();
                        const uint8Array = new Uint8Array(arrayBuffer);
                        await file.write(uint8Array);
                        await file.close();

                        return fileUri;
                        //const blobb = new Blob([uint8Array], { type: 'image/webp' });
                        // Create and return an object URL
                        //return URL.createObjectURL(blobb);
                    }
                    else if(Platform.OS === 'web') {
                        try {
                            // Check if File System Access API is available
                            if ('showSaveFilePicker' in window) {
                                const response = await fetch(imageUrl);
                                const blob = await response.blob();
                                
                                // Prompt user to choose save location
                                const handle = await (window as any).showSaveFilePicker({
                                    suggestedName: `generated_${new Date().getTime()}.webp`,
                                    types: [{
                                        description: 'WebP Image',
                                        accept: {'image/webp': ['.webp']},
                                    }],
                                });
                                
                                // Write the file
                                const writable = await handle.createWritable();
                                await writable.write(blob);
                                await writable.close();
                                
                                return imageUrl;
                            } else {
                                // Fallback for browsers that don't support File System Access API
                                const response = await fetch(imageUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                
                                // Create download link and trigger download
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `generated_${new Date().getTime()}.webp`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                                
                                return imageUrl;
                            }
                        } catch (error) {
                            console.warn('Failed to save image:', error);
                            // If saving fails, still return the URL
                            return imageUrl;
                        }
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