
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
import {
  type Ingredients,
  IngredientsSchema,
  Recipe,
} from './recipe-generator-flow-types';

/**
 * The main function that handles the recipe generation.
 *
 * @param ingredients The list of ingredients and other options.
 * @returns The generated recipe.
 */
export async function generateRecipe(ingredients: Ingredients) {
  const prompt = ai.definePrompt({
    name: 'recipePrompt',
    input: { schema: IngredientsSchema },
    output: { schema: Recipe },
    prompt: `
      You are an expert chef. Generate a creative and delicious recipe using the following ingredients: {{{ingredients}}}.
      
      {{#if (ne diet "None")}}The recipe must adhere to a {{{diet}}} diet.{{/if}}
      {{#if (ne cuisine "Any")}}The recipe should be in a {{{cuisine}}} cuisine style.{{/if}}

      The output should be a JSON object with the fields "name", "description", "ingredients", and "instructions".
      The "ingredients" field should be an array of strings, including quantities.
      The "instructions" field should be an array of strings, with each string being a step in the recipe.
    `,
  });

  const { output } = await prompt(ingredients);
  return output;
}
