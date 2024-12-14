
import { ImageProvider } from '@/src/types/image';
import { Model } from '@/types/core';
import axios from 'axios';
export class ReplicateProvider implements ImageProvider {
    async generateImage(prompt: string, model: Model, signal?: AbortSignal): Promise<string> {
        try {
          // Create prediction
          const createResponse = await axios.post(
            `${model.provider.endpoint}/predictions`,
            {
                "aspect_ratio": "1:1",
                "go_fast": true,
                "megapixels": "1",
                "num_inference_steps": 4,
                "num_outputs": 1,
                "output_format": "webp",
                "output_quality": 80,
                "prompt": prompt
            },
            {
              headers: {
                'Authorization': `Token ${model.provider.apiKey}`,
                'Content-Type': 'application/json'
              },
              signal
            }
          );

          const predictionUrl = createResponse.data.urls.get;
    
          // Poll for completion
          while (true) {
            const statusResponse = await axios.get(
              predictionUrl,
              {
                headers: {
                  'Authorization': `Token ${model.provider.apiKey}`
                },
                signal
              }
            );
    
            const prediction = statusResponse.data;
    
            if (prediction.status === 'succeeded') {
              // Replicate typically returns an array of image URLs, we'll take the first one
              return prediction.output[0];
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