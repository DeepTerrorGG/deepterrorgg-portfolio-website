'use server';

/**
 * @fileoverview A very simple Genkit flow for testing text generation.
 *
 * It exports the following functions:
 * - generateSimpleText: Takes a string prompt and returns a string response.
 */

import { ai } from '@/ai/genkit';

/**
 * A basic text generation function.
 * @param prompt The user's text input.
 * @returns The AI's response as a string.
 */
export async function generateSimpleText(prompt: string): Promise<string> {
  if (!prompt) {
    return 'Please provide a prompt.';
  }

  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
    });
    return text;
  } catch (error: any) {
    console.error('Error in generateSimpleText:', error);
    return `Sorry, an error occurred: ${error.message}`;
  }
}
