
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NutritionInputSchema = z.object({
  ingredients: z.string().describe("A string containing a list of ingredients, e.g., '1 cup of rice, 100g of chicken breast'"),
});

// Zod schema based on Edamam's API response structure
const NutrientInfoSchema = z.object({
  label: z.string(),
  quantity: z.number(),
  unit: z.string(),
}).optional();

export const NutritionAnalysisSchema = z.object({
  calories: z.number(),
  totalWeight: z.number(),
  totalNutrients: z.object({
    ENERC_KCAL: NutrientInfoSchema,
    FAT: NutrientInfoSchema,
    CHOCDF: NutrientInfoSchema,
    PROCNT: NutrientInfoSchema,
    FIBTG: NutrientInfoSchema,
    SUGAR: NutrientInfoSchema,
    NA: NutrientInfoSchema, // Sodium
    CA: NutrientInfoSchema, // Calcium
    FE: NutrientInfoSchema, // Iron
    VITA_RAE: NutrientInfoSchema, // Vitamin A
    VITC: NutrientInfoSchema, // Vitamin C
  }),
  totalDaily: z.object({
    ENERC_KCAL: NutrientInfoSchema,
    FAT: NutrientInfoSchema,
    CHOCDF: NutrientInfoSchema,
    PROCNT: NutrientInfoSchema,
    FIBTG: NutrientInfoSchema,
    NA: NutrientInfoSchema,
    CA: NutrientInfoSchema,
    FE: NutrientInfoSchema,
    VITA_RAE: NutrientInfoSchema,
    VITC: NutrientInfoSchema,
  }),
});
export type NutritionAnalysis = z.infer<typeof NutritionAnalysisSchema>;


const nutritionAnalysisTool = ai.defineTool(
  {
    name: 'nutritionAnalysisTool',
    description: 'Get detailed nutrition analysis for a list of ingredients.',
    inputSchema: z.object({
        ingr: z.array(z.string()).describe("An array of ingredients, e.g., ['1 cup rice', '100g chicken breast']"),
    }),
    outputSchema: NutritionAnalysisSchema,
  },
  async (input) => {
    const appId = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
    const appKey = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;
    const url = `https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingr: input.ingr }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Edamam API Error:", errorText);
        throw new Error(`Failed to fetch nutrition data. Status: ${response.status}.`);
    }

    return response.json();
  }
);


const analyzeIngredientsPrompt = ai.definePrompt({
    name: 'analyzeIngredientsPrompt',
    input: { schema: NutritionInputSchema },
    output: { schema: NutritionAnalysisSchema },
    tools: [nutritionAnalysisTool],
    prompt: `Analyze the nutrition for the following ingredients: {{{ingredients}}}.
    
    You must call the nutritionAnalysisTool to get the data. The input for the tool should be an array of strings, where each string is one ingredient from the user's list. For example, if the user input is "1 cup rice, 100g chicken", the input to the tool should be ["1 cup rice", "100g chicken"].
    `,
});

export async function analyzeNutrition(
  input: z.infer<typeof NutritionInputSchema>
): Promise<NutritionAnalysis> {
  const ingredientsArray = input.ingredients.split(',').map(s => s.trim()).filter(s => s);
  
  const { output } = await analyzeIngredientsPrompt(input);

  if (!output) {
      throw new Error('The AI failed to process the ingredients.');
  }

  // Find the tool response from the output history
  const toolResponse = output.history?.find(
    (turn) => turn.role === 'tool' && turn.content[0]?.toolResponse?.name === 'nutritionAnalysisTool'
  );

  if (!toolResponse) {
      throw new Error('The AI did not call the nutrition tool as expected.');
  }

  const nutritionData = toolResponse.content[0].toolResponse!.output;
  
  // Zod parse to ensure data is in the correct format
  const parsedData = NutritionAnalysisSchema.safeParse(nutritionData);
  if (!parsedData.success) {
      console.error("Zod validation failed:", parsedData.error);
      throw new Error("Received invalid data format from the nutrition API.");
  }
  
  return parsedData.data;
}

