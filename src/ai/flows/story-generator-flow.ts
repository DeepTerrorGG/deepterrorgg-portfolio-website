'use server';
/**
 * @fileOverview A Genkit flow to generate a short story from a prompt.
 *
 * - generateStory - Generates a story based on a user-provided prompt.
 * - GenerateStoryInput - Input type for the flow.
 * - GenerateStoryOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe('A short prompt or starting sentence for the story.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

export const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story, which should be at least three paragraphs long.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'storyPrompt',
  input: { schema: GenerateStoryInputSchema },
  output: { schema: GenerateStoryOutputSchema },
  prompt: `You are a master storyteller. Write a short, engaging story based on the following prompt. The story should be imaginative, well-structured, and at least three paragraphs long.

Prompt: "{{prompt}}"

Generate a compelling narrative with a clear beginning, middle, and end.`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async (input) => {
    const { output } = await storyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a story.');
    }
    return output;
  }
);
