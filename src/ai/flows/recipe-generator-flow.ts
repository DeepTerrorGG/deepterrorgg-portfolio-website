
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
 */

import { ai } from '@/ai/genkit';
import { type Ingredients, Recipe } from './recipe-generator-flow-types';

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
