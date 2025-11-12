'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CraftItemInputSchema = z.object({
  item1: z.string().describe('The first item to combine.'),
  item2: z.string().describe('The second item to combine.'),
});
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;

export const CraftItemOutputSchema = z.object({
  result: z.string().describe('The single, resulting item from the combination. Should be a noun, like "Steam", "Mud", or "Life".'),
});

export async function craftItem(input: CraftItemInput): Promise<string | null> {

  const prompt = `You are a creative crafting game AI, like "Infinite Craft" or "Little Alchemy". 
Your task is to determine the logical, creative, or metaphorical result of combining two items.
The result should always be a single concept or noun.

Examples:
- Water + Fire = Steam
- Earth + Water = Mud
- Plant + Sun = Tree
- Human + Stone = Sculpture
- Water + Water = Lake
- Lake + Lake = Sea

Combine the following two items: ${input.item1} + ${input.item2}

The result should be a simple JSON object with a single key "result".
`;

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
    output: {
        format: 'json',
        schema: CraftItemOutputSchema,
    },
  });

  const structuredResponse = output?.structured;
  
  if (!structuredResponse) {
    return null;
  }
  
  return structuredResponse.result;
}
