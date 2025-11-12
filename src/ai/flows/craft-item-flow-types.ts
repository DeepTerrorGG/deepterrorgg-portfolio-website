'use client';

import { z } from 'zod';

export const CraftItemInputSchema = z.object({
  item1: z.string().describe('The first item to combine.'),
  item2: z.string().describe('The second item to combine.'),
});
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;

export const CraftItemOutputSchema = z.object({
  result: z.string().describe('The single, resulting item from the combination. Should be a noun, like "Steam", "Mud", or "Life".'),
});
export type CraftItemOutput = z.infer<typeof CraftItemOutputSchema>;
