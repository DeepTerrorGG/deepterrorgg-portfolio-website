'use client';

import { z } from 'zod';

export const PromptTypeSchema = z.enum(['Text', 'Image', 'Video', 'Code']);
export type PromptType = z.infer<typeof PromptTypeSchema>;

export const TargetModelSchema = z.enum(['Gemini', 'DALL-E', 'Midjourney', 'Stable Diffusion', 'Imagen', 'Veo']);
export type TargetModel = z.infer<typeof TargetModelSchema>;

export const ImageStyleSchema = z.enum(['Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art', 'Cinematic', '3D Model', 'Vintage Photo']);
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

const TextPromptDetailsSchema = z.object({
  persona: z.string().optional(),
  task: z.string().optional(),
});

const ImagePromptDetailsSchema = z.object({
  style: ImageStyleSchema.optional(),
  composition: z.string().optional(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  negativePrompt: z.string().optional(),
});

const VideoPromptDetailsSchema = z.object({
  scene: z.string().optional(),
  shotType: z.string().optional(),
  style: z.string().optional(),
});

const CodePromptDetailsSchema = z.object({
  language: z.string().optional(),
  task: z.string().optional(),
  constraints: z.string().optional(),
});

export const PromptEnhancerInputSchema = z.object({
  idea: z.string().describe('The user\'s basic prompt or idea.'),
  promptType: PromptTypeSchema,
  targetModel: TargetModelSchema,
  details: z.union([
    TextPromptDetailsSchema,
    ImagePromptDetailsSchema,
    VideoPromptDetailsSchema,
    CodePromptDetailsSchema,
  ]),
});
export type PromptEnhancerInput = z.infer<typeof PromptEnhancerInputSchema>;

export const PromptEnhancerOutputSchema = z.object({
  enhancedPrompt: z
    .string()
    .describe('The detailed, enhanced prompt suitable for a large language model.'),
});
export type PromptEnhancerOutput = z.infer<typeof PromptEnhancerOutputSchema>;
