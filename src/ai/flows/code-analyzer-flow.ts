
'use server';

/**
 * @fileoverview An AI flow for analyzing and manipulating code.
 *
 * This file defines a Genkit flow that can explain, refactor, or add comments
 * to a given code snippet.
 *
 * It exports the following:
 * - analyzeCode: The main function that handles the code analysis.
 */

import { ai } from '@/ai/genkit';
import { 
  type CodeAnalysisInput, 
  CodeAnalysisInputSchema 
} from './code-analyzer-flow-types';


// Define the prompt for the AI model.
const codeAnalysisPrompt = ai.definePrompt({
  name: 'codeAnalysisPrompt',
  input: { schema: CodeAnalysisInputSchema },
  prompt: `You are an expert software engineer. Perform the following task on the given code: {{{task}}}.\n\nCode:\n\`\`\`\n{{{code}}}\n\`\`\``,
});

/**
 * The main function that handles the code analysis logic.
 *
 * @param input The code and the task to perform.
 * @returns The AI's response as a string.
 */
export async function analyzeCode(input: CodeAnalysisInput) {
  const { output } = await codeAnalysisPrompt(input);
  return output?.text;
}
