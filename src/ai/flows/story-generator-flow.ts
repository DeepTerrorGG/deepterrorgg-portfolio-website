
'use server';

/**
 * @fileoverview A story generator that creates stories from a prompt.
 *
 * This file defines a Genkit flow that takes a prompt as input and returns a
 * story.
 *
 * It exports the following functions:
 * - generateStory: The main function that handles the story generation.
 */

import { ai } from '@/ai/genkit';
import { type StoryPrompt, type Story } from './story-generator-flow-types';

/**
 * The main function that handles the story generation.
 *
 * @param prompt The prompt for the story.
 * @returns The generated story.
 */
export async function generateStory(prompt: StoryPrompt): Promise<Story | null> {
  
  let constructedPrompt = `Write a creative and engaging story based on the following details.

Character: ${prompt.character}
Setting: ${prompt.setting}
`;

  if (prompt.genre && prompt.genre !== 'Any') {
    constructedPrompt += `Genre: ${prompt.genre}\n`;
  }
  if (prompt.style && prompt.style !== 'Default') {
    constructedPrompt += `Literary Style: ${prompt.style}\n`;
  }
  if (prompt.twist && prompt.twist !== 'None') {
    constructedPrompt += `Incorporate the following plot twist: ${prompt.twist}\n`;
  }

  constructedPrompt += `
The story must have a clear beginning, middle, and end. It should be well-structured with a compelling title.
Ensure the tone of the story matches the specified genre and style.
The output must be a JSON object with two fields: "title" (a string) and "story" (a string).
`;

  const { output } = await ai.generate({
      prompt: constructedPrompt,
      model: 'googleai/gemini-pro',
      output: {
          format: 'json'
      }
  });

  const responseText = output?.text;
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as Story;
  } catch (e) {
    console.error("Failed to parse story JSON:", e);
    return null;
  }
}
