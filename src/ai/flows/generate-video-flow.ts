
'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { type MediaPart, type GenerateRequest } from 'genkit';
import { z } from 'zod';

const GenerateVideoInputSchema = z.object({
  prompt: z.string(),
  aspectRatio: z.enum(['16:9', '9:16', '4:3', '1:1']),
  negativePrompt: z.string().optional(),
});

const GenerateVideoOutputSchema = z.object({
  video: z.string().optional(),
  status: z.string(),
});

type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;
type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;
type Operation = GenerateRequest['pluginsData']['googleai']['operation'];

async function downloadVideo(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    
    // Add API key before fetching the video.
    const url = video.media?.url?.startsWith('http') 
        ? `${video.media.url}&key=${process.env.GEMINI_API_KEY}` 
        : video.media!.url; // It could be a data URI already

    if (!url) throw new Error('Video URL is missing.');
    if (url.startsWith('data:')) return url; // Already a data URI

    const videoDownloadResponse = await fetch(url);
    
    if (!videoDownloadResponse || videoDownloadResponse.status !== 200 || !videoDownloadResponse.body) {
        throw new Error(`Failed to fetch video. Status: ${videoDownloadResponse.status}`);
    }

    const videoBuffer = await videoDownloadResponse.buffer();
    return `data:video/mp4;base64,${videoBuffer.toString('base64')}`;
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-fast-generate-001'),
      prompt: input.prompt,
      config: {
        aspectRatio: input.aspectRatio,
        personGeneration: "allow_all", // Use 'allow_all' for Veo 3
        negativePrompt: input.negativePrompt,
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }
    
    // Wait until the operation completes.
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find((p) => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video in the operation result.');
    }
    
    const videoDataUri = await downloadVideo(video);

    return {
        video: videoDataUri,
        status: "done"
    };
  }
);


export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoOutput> {
  return generateVideoFlow(input);
}
