'use server';
/**
 * @fileOverview A Genkit flow to generate project thumbnail images.
 *
 * - generateProjectImage - Generates an image based on a prompt.
 * - GenerateProjectImageInput - Input type for the flow.
 * - GenerateProjectImageOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProjectImageInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the image to be generated (e.g., "abstract fractal visualization", "modern calculator interface"). Should be concise.'),
  // Optional: add aspectRatio or dimensions if your model supports it explicitly
});
export type GenerateProjectImageInput = z.infer<typeof GenerateProjectImageInputSchema>;

const GenerateProjectImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI (e.g., 'data:image/png;base64,...')."),
});
export type GenerateProjectImageOutput = z.infer<typeof GenerateProjectImageOutputSchema>;

export async function generateProjectImage(input: GenerateProjectImageInput): Promise<GenerateProjectImageOutput> {
  return generateProjectImageFlow(input);
}

const generateProjectImageFlow = ai.defineFlow(
  {
    name: 'generateProjectImageFlow',
    inputSchema: GenerateProjectImageInputSchema,
    outputSchema: GenerateProjectImageOutputSchema,
  },
  async (input) => {
    console.log(`[generateProjectImageFlow] Generating image for prompt: "${input.prompt}"`);
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-2',
        prompt: `Generate a visually appealing and clear thumbnail image (approx 320x180 aspect ratio) representing: ${input.prompt}. The style should be modern and clean, suitable for a project portfolio.`,
        config: {
          responseModalities: ['IMAGE'], // Request only IMAGE modality for this flow
          // You might need to adjust safetySettings if prompts are too generic or trigger filters
           safetySettings: [ // Looser settings for creative generation, adjust as needed
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          ],
        },
      });

      if (!media || !media.url) {
        console.error('[generateProjectImageFlow] No media URL returned from image generation.');
        throw new Error('Image generation failed to return a media URL.');
      }

      console.log(`[generateProjectImageFlow] Image generated successfully: ${media.url.substring(0,50)}...`);
      return { imageDataUri: media.url };

    } catch (error) {
      console.error('[generateProjectImageFlow] Error generating image:', error);
      // Fallback to a placeholder or rethrow, depending on desired error handling
      // For now, rethrowing to make it clear generation failed.
      throw new Error(`Failed to generate image for prompt "${input.prompt}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
