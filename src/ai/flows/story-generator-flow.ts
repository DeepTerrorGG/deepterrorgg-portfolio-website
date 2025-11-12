
'use server';

/**
 * @fileoverview A story generator that creates stories from a prompt.
 *
 * This file defines a Genkit flow that takes a prompt as input and returns a
 * story.
 *
 * It exports the following functions:
 * - generateStory: The main function that handles the story generation.
 * - Story, StoryPrompt: The type definitions for the story and story prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/** The type definition for the story prompt. */
export const StoryPrompt = z.object({
  character: z.string(),
  setting: z.string(),
});
export type StoryPrompt = z.infer<typeof StoryPrompt>;

/** The type definition for the story. */
export const Story = z.object({
  title: z.string(),
  story: z.string(),
});
export type Story = z.infer<typeof Story>;

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
      input: { schema: StoryPrompt },
      output: { schema: Story },
      prompt: `Write a story about {{{character}}} in {{{setting}}}.`,
    },
  );

  const { output } = await storyPrompt(prompt);
  return output;
}
