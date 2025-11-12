
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
import { type StoryPrompt, StoryPromptSchema, Story } from './story-generator-flow-types';

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
      input: { schema: StoryPromptSchema },
      output: { schema: Story },
      prompt: `
        Write a creative and engaging story based on the following details.
        
        Character: {{{character}}}
        Setting: {{{setting}}}
        {{#if (ne genre "Any")}}Genre: {{{genre}}}{{/if}}
        {{#if (ne style "Default")}}Literary Style: {{{style}}}{{/if}}
        {{#if (ne twist "None")}}Incorporate the following plot twist: {{{twist}}}{{/if}}

        The story must have a clear beginning, middle, and end. It should be well-structured with a compelling title.
        Ensure the tone of the story matches the specified genre and style.
      `,
    },
  );

  const { output } = await storyPrompt(prompt);
  return output;
}
