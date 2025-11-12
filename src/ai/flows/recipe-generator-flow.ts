
'use server';

/**
 * @fileoverview A recipe generator that creates recipes from a list of
 * ingredients.
 *
 * This file defines a Genkit flow that takes a list of ingredients as input
 * and returns a recipe.
 *
 * It exports the following functions:
 * - generateRecipe: The main function that handles the recipe generation.
 * - Recipe, Ingredients: The type definitions for the recipe and ingredients.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/** The type definition for the ingredients. */
export const Ingredients = z.object({
  ingredients: z.array(z.string()),
});
export type Ingredients = z.infer<typeof Ingredients>;

/** The type definition for the recipe. */
export const Recipe = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.array(z.string()),
});
export type Recipe = z.infer<typeof Recipe>;

/**
 * The main function that handles the recipe generation.
 *
 * @param ingredients The list of ingredients.
 * @returns The generated recipe.
 */
export async function generateRecipe(ingredients: Ingredients) {
  const prompt = ai.definePrompt(
    {
      name: 'recipePrompt',
      input: { schema: Ingredients },
      output: { schema: Recipe },
      prompt: `Generate a recipe using the following ingredients: {{{ingredients}}}.`,
    },
  );

  const { output } = await prompt(ingredients);
  return output;
}
