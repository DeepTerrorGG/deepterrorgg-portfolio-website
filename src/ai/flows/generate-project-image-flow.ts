
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
import { type MediaPart } from 'genkit';
import { type ImageGenerationInput } from './generate-project-image-flow-types';


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

    let media;

    if (imageDataUris && imageDataUris.length > 0) {
        // Image-to-image generation using Gemini Vision
        const promptParts: MediaPart[] = imageDataUris.map(uri => ({ media: { url: uri } }));
        promptParts.push({ text: fullPrompt });

        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image',
            prompt: promptParts,
            config: {
                responseModalities: ['IMAGE', 'TEXT'],
            }
        });
        media = response.media;

    } else {
        // Text-to-image generation using Imagen
        const response = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: fullPrompt,
        });
        media = response.media;
    }

    if (!media?.url) {
        // Handle cases where the AI returns no image (e.g., safety policy violation)
        throw new Error('The AI failed to generate an image. This may be due to the prompt content or a temporary service issue. Please try a different prompt.');
    }

    return media.url;
}
