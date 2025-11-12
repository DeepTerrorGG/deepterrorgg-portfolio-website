
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
import { type ImageGenerationInput, ImageGenerationInputSchema } from './generate-project-image-flow-types';

/**
 * The main function that handles the image generation.
 *
 * @param input The description and style of the image to generate.
 * @returns A data URL representing the generated image.
 */
export async function generateProjectImage(input: ImageGenerationInput) {
    const { description, style } = input;
    const stylePrompt = style === 'Default' ? '' : `in a ${style.toLowerCase()} style, `;

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate',
        prompt: `A high-quality, creative image representing a software project. The image should be visually interesting and capture the essence of the following description: "${description}". The image should be ${stylePrompt}professional and polished.`,
    });
    return media.url;
}
