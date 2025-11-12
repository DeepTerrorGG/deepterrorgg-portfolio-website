
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
} from './code-analyzer-flow-types';


/**
 * The main function that handles the code analysis logic.
 *
 * @param input The code and the task to perform.
 * @returns The AI's response as a string.
 */
export async function analyzeCode(input: CodeAnalysisInput) {
    const { task, code, language } = input;

    let prompt = `You are an expert software engineer.
Perform the following task on the given code: ${task}.
`;

    if (language && language !== 'Auto-detect') {
        prompt += `The code is written in ${language}.\n`;
    }

    prompt += `
When refactoring or commenting, return only the raw code block. Do not add any explanations or markdown formatting.
When explaining, format your response using Markdown.

Code:
\'\'\'
${code}
\'\'\'
`;

  const { output } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
  });

  return output?.message?.content[0]?.text;
}
