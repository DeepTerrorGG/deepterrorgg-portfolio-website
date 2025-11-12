
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
        format: 'json'
      }
  });

  const responseText = output?.text;
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as Recipe;
  } catch (e) {
    console.error("Failed to parse recipe JSON:", e);
    return null;
  }
}
