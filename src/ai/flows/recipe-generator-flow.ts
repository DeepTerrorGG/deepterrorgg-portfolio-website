'use server';
/**
 * @fileOverview A Genkit flow to generate recipes from a list of ingredients.
 *
 * - generateRecipe - Generates a recipe based on user-provided ingredients.
 * - GenerateRecipeInput - Input type for the flow.
 * - GenerateRecipeOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients the user has.'),
  mealType: z.string().describe('The type of meal the user wants to make (e.g., breakfast, lunch, dinner, dessert).'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The creative name of the generated recipe.'),
  description: z.string().describe('A short, enticing description of the dish.'),
  ingredients: z.array(z.string()).describe('A list of all ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('A step-by-step list of instructions to prepare the dish.'),
  prepTime: z.string().describe('Estimated preparation time (e.g., "15 minutes").'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const recipePrompt = ai.definePrompt({
  name: 'recipePrompt',
  input: { schema: GenerateRecipeInputSchema },
  output: { schema: GenerateRecipeOutputSchema },
  prompt: `You are a creative chef. Generate a delicious recipe for a "{{mealType}}" using the following ingredients: {{{ingredients}}}.
  
  You can include other common pantry staples if needed.
  
  Please provide a creative name for the dish, a short description, a list of all ingredients, a list of step-by-step instructions, and the estimated preparation time.
  Ensure the output is in the correct JSON format.`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await recipePrompt(input);
    if (!output) {
      throw new Error('Failed to generate a recipe.');
    }
    return output;
  }
);
