
'use client';

import { z } from 'zod';

export const ImageStyleSchema = z.enum([
    'Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art', 'Cinematic', '3D Model', 'Vintage Photo'
]);
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

export const AspectRatioSchema = z.enum(['1:1', '16:9', '9:16', '4:3', '3:2', '3:4', '2:3']);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

export const ImageGenerationInputSchema = z.object({
  description: z.string(),
  style: ImageStyleSchema,
  aspectRatio: AspectRatioSchema,
  imageDataUris: z.array(z.string()).optional().describe(
    "Optional base images as data URIs. If provided, the generation will be based on these images. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;
