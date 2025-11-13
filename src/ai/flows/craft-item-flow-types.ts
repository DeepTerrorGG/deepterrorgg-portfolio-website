
'use client';

import { z } from 'zod';

export const CraftItemInputSchema = z.object({
  item1: z.string().describe('The first item to combine.'),
  item2: z.string().describe('The second item to combine.'),
});
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;
