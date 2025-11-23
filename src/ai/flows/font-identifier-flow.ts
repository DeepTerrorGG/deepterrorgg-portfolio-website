
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { FontIdentifierInputSchema, FontAnalysisSchema, type FontAnalysis } from './font-identifier-flow-types';


const identifyFontPrompt = ai.definePrompt({
  name: 'identifyFontPrompt',
  input: { schema: FontIdentifierInputSchema },
  output: { schema: FontAnalysisSchema },
  prompt: `You are an expert typographer and font identifier. Analyze the font used in the provided image.

  Your task is to:
  1.  Write a detailed Markdown-formatted description of the font's visual characteristics. Include aspects like:
      -   **Classification:** Is it a Serif, Sans-Serif, Script, Display, or Monospace font?
      -   **Weight:** Is it Light, Regular, Bold, Black?
      -   **Contrast:** Is there a large difference between thick and thin strokes?
      -   **X-Height:** How tall are the lowercase letters compared to uppercase?
      -   **Mood/Feel:** What is the overall feeling it evokes (e.g., modern, classic, playful, corporate, elegant)?
  
  2.  Based on your analysis, provide a list of 3-5 common, real-world fonts that are visually similar. Do not claim to identify the exact font, but rather provide good alternatives.

  Image: {{media url=imageDataUri}}`,
});

export async function analyzeFont(
  input: z.infer<typeof FontIdentifierInputSchema>
): Promise<FontAnalysis> {
  const { output } = await identifyFontPrompt(input);
  if (!output) {
    throw new Error('The AI failed to analyze the font.');
  }
  return output;
}
