
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
import { type ImageGenerationInput } from './generate-project-image-flow-types';
import { MediaPart } from 'genkit';

/**
 * The main function that handles the image generation.
 *
 * @param input The description and style of the image to generate.
 * @returns A data URL representing the generated image.
 */
export async function generateProjectImage(input: ImageGenerationInput) {
    const { description, style, aspectRatio, imageDataUris } = input;
    
    const stylePrompt = style === 'Default' ? '' : `in a ${style.toLowerCase()} style, `;
    const fullPrompt = `A high-quality, creative image. The image should be visually interesting and capture the essence of the following description: "${description}". The image should be ${stylePrompt}professional and polished. The desired aspect ratio is ${aspectRatio}.`;
    
    if (imageDataUris && imageDataUris.length > 0) {
        // Image-to-Image generation
        const promptParts: (string | MediaPart)[] = imageDataUris.map(uri => ({ media: { url: uri } }));
        promptParts.push({ text: fullPrompt });

        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image-preview',
            prompt: promptParts,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media.url;

    } else {
        // Text-to-Image generation
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: fullPrompt,
        });
        return media.url;
    }
}
