
'use client';

import { z } from 'zod';

export const ImageStyleSchema = z.enum([
    'Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art'
]);
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

export const ImageGenerationInputSchema = z.object({
  description: z.string(),
  style: ImageStyleSchema,
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;
