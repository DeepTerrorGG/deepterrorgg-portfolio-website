
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
  
  let systemPrompt = `You are an expert chef. The user will provide a list of ingredients and some options. Generate a creative and delicious recipe based on their input.
You must respond with ONLY a valid JSON object string. Do not include any other text or markdown formatting.
The JSON object must have the fields "name", "description", "ingredients" (an array of strings), and "instructions" (an array of strings).
The "ingredients" field should include quantities. The "instructions" field should have each string be a step in the recipe.`;

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

  try {
    // Clean the raw text response to extract only the JSON part.
    // The AI sometimes wraps the JSON in ```json ... ```
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    
    let jsonString = text;
    if (match) {
      jsonString = match[1];
    }

    const parsed = JSON.parse(jsonString);
    const validated = RecipeSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    } else {
      console.error("AI returned invalid recipe format:", validated.error);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error);
    return null;
  }
}
