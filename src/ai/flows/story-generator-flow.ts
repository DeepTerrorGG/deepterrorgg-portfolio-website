
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
import { type StoryPrompt } from './story-generator-flow-types';

/**
 * The main function that handles the story generation.
 *
 * @param prompt The prompt for the story.
 * @returns The generated story as a string.
 */
export async function generateStory(prompt: StoryPrompt): Promise<string> {
  
  let systemPrompt = `You are a creative writing assistant. You will be given a set of parameters and must write a creative and engaging story based on them.
The story must have a clear beginning, middle, and end. It should be well-structured and titled.
Ensure the tone of the story matches the specified genre and style.
Start the story with a title on its own line, like this:
The Lost Compass

Then, write the full story. Do not add any other formatting.`;
  
  let userPrompt = `Generate a story with the following details:\n
Character: ${prompt.character}
Setting: ${prompt.setting}
`;

  if (prompt.genre && prompt.genre !== 'Any') {
    userPrompt += `Genre: ${prompt.genre}\n`;
  }
  if (prompt.style && prompt.style !== 'Default') {
    userPrompt += `Literary Style: ${prompt.style}\n`;
  }
  if (prompt.twist && prompt.twist !== 'None') {
    userPrompt += `Incorporate the following plot twist: ${prompt.twist}\n`;
  }

  const { text } = await ai.generate({
    prompt: userPrompt,
    system: systemPrompt,
    model: 'googleai/gemini-2.0-flash',
  });

  return text;
}
