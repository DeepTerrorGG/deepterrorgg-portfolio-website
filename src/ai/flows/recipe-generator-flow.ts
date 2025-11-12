
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
  type Recipe,
  RecipeSchema,
} from './recipe-generator-flow-types';

/**
 * The main function that handles the recipe generation.
 *
 * @param ingredients The list of ingredients and other options.
 * @returns The generated recipe.
 */
export async function generateRecipe(ingredients: Ingredients): Promise<Recipe | null> {
  
  let prompt = `You are an expert chef. Generate a creative and delicious recipe using the following ingredients: ${ingredients.ingredients.join(', ')}.`;

  if (ingredients.diet && ingredients.diet !== 'None') {
    prompt += `\nThe recipe must adhere to a ${ingredients.diet} diet.`;
  }
  if (ingredients.cuisine && ingredients.cuisine !== 'Any') {
    prompt += `\nThe recipe should be in a ${ingredients.cuisine} cuisine style.`;
  }

  prompt += `
The output should be a JSON object with the fields "name", "description", "ingredients", and "instructions".
The "ingredients" field should be an array of strings, including quantities.
The "instructions" field should be an array of strings, with each string being a step in the recipe.
`;

  const { output } = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        format: 'json',
        schema: RecipeSchema,
      }
  });

  const structuredResponse = output?.structured;
  
  if (!structuredResponse) {
    return null;
  }
  
  // The response is already a parsed object that should match the 'Recipe' schema.
  return structuredResponse as Recipe;
}
