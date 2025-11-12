
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
import { type StoryPrompt, Story } from './story-generator-flow-types';

/**
 * The main function that handles the story generation.
 *
 * @param prompt The prompt for the story.
 * @returns The generated story.
 */
export async function generateStory(prompt: StoryPrompt) {
  const storyPrompt = ai.definePrompt(
    {
      name: 'storyPrompt',
      input: { schema: Story }, // The prompt object contains StoryPrompt fields
      output: { schema: Story },
      prompt: `Write a story about {{{character}}} in {{{setting}}}.`,
    },
  );

  const { output } = await storyPrompt(prompt);
  return output;
}
