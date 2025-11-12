
'use client';

/**
 * @fileoverview Type definitions for the recipe generator flow.
 *
 * This file defines and exports the data structures (types and Zod schemas)
 * used by the recipe generator flow. It is separate from the server action file to
 * allow these types to be used in client components without bundling
 * server-side code.
 *
 * It exports the following:
 * - Recipe, Ingredients, IngredientsSchema: The type definitions and schemas for the recipe and ingredients.
 */

import { z } from 'zod';

/** The type definition for the ingredients. */
export const IngredientsSchema = z.object({
  ingredients: z.array(z.string()),
});
export type Ingredients = z.infer<typeof IngredientsSchema>;

/** The type definition for the recipe. */
export const Recipe = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.array(z.string()),
});
export type Recipe = z.infer<typeof Recipe>;
