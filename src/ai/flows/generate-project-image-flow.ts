
'use server';

/**
 * @fileoverview A flow that generates an image for a software project.
 *
 * This file defines a Genkit flow that takes a project description as input
 * and returns a generated image.
 *
 * It exports the following functions:
 * - generateProjectImage: The main function that handles the image generation.
 */

import { ai } from '@/ai/genkit';

/**
 * The main function that handles the image generation.
 *
 * @param projectDescription The description of the software project.
 * @returns A data URL representing the generated image.
 */
export async function generateProjectImage(projectDescription: string) {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: `a software project: ${projectDescription}`,
  });
  return media.url;
}
