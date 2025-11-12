'use client';

import { z } from 'zod';

export const CraftItemInputSchema = z.object({
  item1: z.string().describe('The first item to combine.'),
  item2: z.string().describe('The second item to combine.'),
});

export const CraftItemOutputSchema = z.object({
  result: z.string().describe('The single, resulting item from the combination. Should be a noun, like "Steam", "Mud", or "Life".'),
});
