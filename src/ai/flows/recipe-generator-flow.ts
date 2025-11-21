
'use server';

/**
 * @fileoverview A recipe generator that creates recipes from a list of
 * ingredients.
 *
 * This file defines a Genkit flow that takes a list of ingredients as input
 * and returns a recipe as a formatted Markdown string.
 *
 * It exports the following functions:
 * - generateRecipe: The main function that handles the recipe generation.
 */

import { ai } from '@/ai/genkit';
import {
  type Ingredients,
} from './recipe-generator-flow-types';

/**
 * The main function that handles the recipe generation.
 *
 * @param ingredients The list of ingredients and other options.
 * @returns The generated recipe as a Markdown formatted string.
 */
export async function generateRecipe(ingredients: Ingredients): Promise<string | null> {
  
  let systemPrompt = `You are an expert chef. The user will provide a list of ingredients and some options. Generate a creative and delicious recipe based on their input.
You must respond with ONLY the recipe formatted in Markdown. Do not include any other text.
The format should be:
# Recipe Name
A short, enticing description of the dish.

## Ingredients
- 1 cup of Ingredient A
- 2 tbsp of Ingredient B

## Instructions
1. First step of the recipe.
2. Second step of the recipe.
`;

  let userPrompt = `I have the following ingredients: ${ingredients.ingredients.join(', ')}.`;

  if (ingredients.diet && ingredients.diet !== 'None') {
    userPrompt += `\nPlease make sure the recipe is ${ingredients.diet}.`;
  }
  if (ingredients.cuisine && ingredients.cuisine !== 'Any') {
    userPrompt += `\nThe recipe should be in a ${ingredients.cuisine} cuisine style.`;
  }
  if (ingredients.allergies && ingredients.allergies.trim() !== '') {
    userPrompt += `\nCRITICAL: The recipe must NOT contain any of the following ingredients: ${ingredients.allergies}.`;
  }


  const { text } = await ai.generate({
      prompt: userPrompt,
      system: systemPrompt,
      model: 'googleai/gemini-2.0-flash',
  });

  return text || null;
}
