
'use server';

import { ai } from '@/ai/genkit';
import { 
    type CraftItemInput,
    CraftItemOutputSchema 
} from './craft-item-flow-types';

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
    model: 'googleai/gemini-pro',
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
