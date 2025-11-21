'use client';

import { z } from 'zod';

export const PromptTypeSchema = z.enum(['Text', 'Image', 'Video', 'Code']);
export type PromptType = z.infer<typeof PromptTypeSchema>;

// Define specific models for each category
export const TextModels = ['Gemini', 'ChatGPT', 'Claude'] as const;
export const ImageModels = ['Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Imagen'] as const;
export const VideoModels = ['Veo', 'Sora', 'RunwayML'] as const;
export const CodeModels = ['Gemini Code', 'GitHub Copilot', 'CodeLlama'] as const;
const AllModels = [...TextModels, ...ImageModels, ...VideoModels, ...CodeModels] as const;
export const TargetModelSchema = z.enum(AllModels);
export type TargetModel = z.infer<typeof TargetModelSchema>;

export const ImageStyleSchema = z.enum(['Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art', 'Cinematic', '3D Model', 'Vintage Photo']);
export type ImageStyle = z.infer<typeof ImageStyleSchema>;

export const TextPromptDetailsSchema = z.object({
  persona: z.string().optional(),
  task: z.string().optional(),
  format: z.string().optional().describe("e.g., 'JSON object', 'Markdown list'"),
  tone: z.string().optional().describe("e.g., 'Formal', 'Humorous', 'Witty'"),
  length: z.string().optional().describe("e.g., 'one paragraph', '500 words'"),
});

export const ImagePromptDetailsSchema = z.object({
  style: ImageStyleSchema.optional(),
  composition: z.string().optional(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  negativePrompt: z.string().optional(),
  cameraAngle: z.string().optional().describe("e.g., 'low angle', 'drone shot'"),
  lensType: z.string().optional().describe("e.g., '50mm prime', 'wide-angle'"),
  artistInspiration: z.string().optional().describe("e.g., 'in the style of Van Gogh'"),
});

export const VideoPromptDetailsSchema = z.object({
  scene: z.string().optional(),
  shotType: z.string().optional(),
  style: z.string().optional(),
  cameraMovement: z.string().optional().describe("e.g., 'slow pan left', 'handheld tracking shot'"),
  lightingStyle: z.string().optional().describe("e.g., 'Rembrandt lighting', 'neon glow'"),
  colorGrade: z.string().optional().describe("e.g., 'teal and orange', 'sepia tone'"),
});

export const CodePromptDetailsSchema = z.object({
  language: z.string().optional(),
  task: z.string().optional(),
  constraints: z.string().optional(),
  dependencies: z.string().optional().describe("e.g., 'react, lodash'"),
  dataStructures: z.string().optional().describe("e.g., 'use a hash map for lookups'"),
  errorHandling: z.string().optional().describe("e.g., 'throw an error on invalid input'"),
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
